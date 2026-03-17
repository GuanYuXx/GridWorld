from flask import Flask, render_template, request, jsonify
import numpy as np

app = Flask(__name__)

@app.route('/')
def index():
    n = request.args.get('n', 5, type=int)
    return render_template('index.html', n=n)

@app.route('/calculate', methods=['POST'])
def calculate():
    data = request.json
    grid = data['grid']
    noise = float(data.get('noise', 0.0))
    gamma = float(data.get('gamma', 0.9))
    step_reward = float(data.get('step_reward', -1.0))
    V_dict = data.get('V', None)
    
    rows = len(grid)
    cols = len(grid[0]) if rows > 0 else 0
    
    if V_dict is None or len(V_dict) == 0:
        V = np.zeros((rows, cols))
        for r in range(rows):
            for c in range(cols):
                if grid[r][c] == 'goal':
                    V[r, c] = 10.0
                elif grid[r][c] == 'trap':
                    V[r, c] = -10.0
                elif grid[r][c] == 'obstacle':
                    V[r, c] = 0.0
    else:
        # Load V from JS
        V = np.array(V_dict)
    
    new_V = np.copy(V)
    policy = np.zeros((rows, cols), dtype=int)
    # actions: 0: Up, 1: Right, 2: Down, 3: Left
    dirs = [(-1, 0), (0, 1), (1, 0), (0, -1)]
    
    for r in range(rows):
        for c in range(cols):
            if grid[r][c] in ['goal', 'trap', 'obstacle']:
                continue
                
            Q_values = []
            for a in range(4):
                transitions = [
                    (a, 1.0 - 2.0 * noise),
                    ((a - 1) % 4, noise),
                    ((a + 1) % 4, noise)
                ]
                
                expected_value = 0.0
                for act_dir, prob in transitions:
                    if prob == 0: continue
                    dr, dc = dirs[act_dir]
                    nr, nc = r + dr, c + dc
                    
                    if 0 <= nr < rows and 0 <= nc < cols and grid[nr][nc] != 'obstacle':
                        next_v = V[nr, nc]
                    else:
                        next_v = V[r, c]
                        
                    expected_value += prob * (step_reward + gamma * next_v)
                
                Q_values.append(expected_value)
                
            new_V[r, c] = max(Q_values)
            policy[r, c] = int(np.argmax(Q_values))
            
    delta = np.max(np.abs(new_V - V))
    
    return jsonify({
        'V': new_V.tolist(),
        'policy': policy.tolist(),
        'delta': float(delta)
    })

if __name__ == '__main__':
    app.run(debug=True, port=5000)
