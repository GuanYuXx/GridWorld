$(document).ready(function() {
    // 1. Parse URL for grid dimension N
    const urlParams = new URLSearchParams(window.location.search);
    let n = parseInt(urlParams.get('n')) || 5;
    
    // Clamp to [5, 9]
    let showAlert = false;
    if (n < 5) { n = 5; showAlert = true; }
    if (n > 9) { n = 9; showAlert = true; }
    
    if (showAlert) {
        alert("網格的 NxN 要求為 5~9, 已強制設定為 " + n);
        // Correct the URL strictly so users can share it properly
        window.history.replaceState(null, '', `?n=${n}`);
    }

    // 2. Generate Grid DOM dynamically
    let gridWrapper = $('#grid-wrapper');
    gridWrapper.css('--n', n);
    let gridContainer = $('#grid');
    gridContainer.empty();
    
    for (let r = 0; r < n; r++) {
        for (let c = 0; c < n; c++) {
            let cellHtml = `
                <div class="cell" data-r="${r}" data-c="${c}" data-type="empty">
                    <div class="cell-bg"></div>
                    <div class="cell-content">
                        <span class="v-value">0.0</span>
                        <div class="policy-arrow" style="display: none;"></div>
                    </div>
                </div>`;
            gridContainer.append(cellHtml);
        }
    }

    let gridData = Array(n).fill().map(() => Array(n).fill('empty'));
    let VData = null;
    let policyData = null;
    let isRunning = false;
    let iteration = 0;

    // UI Sliders
    $('#gamma').on('input', function() { $('#gamma-val').text(parseFloat($(this).val()).toFixed(2)); resetV(); });
    $('#noise').on('input', function() { $('#noise-val').text(parseFloat($(this).val()).toFixed(2)); resetV(); });
    $('#step_reward').on('input', function() { $('#reward-val').text(parseFloat($(this).val()).toFixed(1)); resetV(); });

    // Handle mouse drag painting
    let isMouseDown = false;
    $('#grid').on('mousedown', function(e) { e.preventDefault(); isMouseDown = true; });
    $(window).on('mouseup', function() { isMouseDown = false; });

    $('.cell').on('mousedown', function(e) {
        paintCell($(this));
    }).on('mouseenter', function(e) {
        if (isMouseDown) {
            paintCell($(this));
        }
    });

    function paintCell(cellObj) {
        let type = $('input[name="brush"]:checked').val();
        let r = parseInt(cellObj.data('r'));
        let c = parseInt(cellObj.data('c'));

        if (gridData[r][c] === type) {
            // Toggle off if the same type is clicked again
            type = 'empty';
            $('#obstacle-hint').hide();
        } else if (type === 'start') {
            $('.cell[data-type="start"]').attr('data-type', 'empty');
            for(let i=0; i<n; i++) for(let j=0; j<n; j++) if(gridData[i][j]==='start') gridData[i][j]='empty';
            $('#obstacle-hint').hide();
        } else if (type === 'goal') {
            $('.cell[data-type="goal"]').attr('data-type', 'empty');
            for(let i=0; i<n; i++) for(let j=0; j<n; j++) if(gridData[i][j]==='goal') gridData[i][j]='empty';
            $('#obstacle-hint').hide();
        } else if (type === 'obstacle') {
            let obsCount = 0;
            for(let i=0; i<n; i++) for(let j=0; j<n; j++) if(gridData[i][j] === 'obstacle') obsCount++;
            
            if (obsCount >= n - 2) {
                // Show inline hint instead of annoying popup
                $('#obstacle-hint').show();
                return;
            }
            $('#obstacle-hint').hide();
        }

        cellObj.attr('data-type', type);
        gridData[r][c] = type;
        resetV();
    }

    function resetV() {
        if(isRunning) {
            isRunning = false;
            $('#btn-run').text('執行至收斂').addClass('success').removeClass('danger');
        }
        VData = null;
        policyData = null;
        iteration = 0;
        $('#iteration-count').text(0);
        $('#delta-value').text('0.000');
        clearPath();
        renderGrid();
    }

    function renderGrid() {
        if (!VData) {
            $('.v-value').text('0.0').css('color', 'rgba(255,255,255,0.4)');
            $('.policy-arrow').hide();
            $('.cell-bg').css('background-color', 'transparent');
            return;
        }

        let maxV = -Infinity;
        let minV = Infinity;
        for(let r=0; r<n; r++) {
            for(let c=0; c<n; c++) {
                if (gridData[r][c] === 'empty' || gridData[r][c] === 'start') {
                    if (VData[r][c] > maxV) maxV = VData[r][c];
                    if (VData[r][c] < minV) minV = VData[r][c];
                }
            }
        }

        for(let r=0; r<n; r++) {
            for(let c=0; c<n; c++) {
                let cell = $(`.cell[data-r="${r}"][data-c="${c}"]`);
                let type = gridData[r][c];
                
                let v = VData[r][c];
                cell.find('.v-value').text(v.toFixed(1)).css('color', 'white');
                
                if (type === 'empty' || type === 'start') {
                    let ratio = 0;
                    if (maxV > minV) ratio = (v - Math.min(minV, 0)) / (Math.max(maxV, 10.0) - Math.min(minV, 0));
                    ratio = Math.max(0, Math.min(1, ratio)); // clamp
                    cell.find('.cell-bg').css('background-color', `rgba(59, 130, 246, ${ratio * 0.7})`);
                } else {
                    cell.find('.cell-bg').css('background-color', 'transparent');
                }

                let arrowObj = cell.find('.policy-arrow');
                if (['empty', 'start'].includes(type) && policyData) {
                    let a = policyData[r][c];
                    let arrows = ['↑', '→', '↓', '←']; // 0: Up, 1: Right, 2: Down, 3: Left
                    arrowObj.text(arrows[a]).show();
                } else {
                    arrowObj.hide();
                }
            }
        }
    }

    function calculateRLStep(grid, noise, gamma, step_reward, oldV) {
        let rows = n;
        let cols = n;
        
        let V = oldV;
        if (!V || V.length === 0) {
            V = Array(rows).fill().map(() => Array(cols).fill(0.0));
            for(let r=0; r<rows; r++) {
                for(let c=0; c<cols; c++) {
                    if (grid[r][c] === 'goal') V[r][c] = 10.0;
                    else if (grid[r][c] === 'obstacle') V[r][c] = 0.0;
                }
            }
        }
        
        // Deep copy V
        let newV = V.map(row => [...row]);
        let policy = Array(rows).fill().map(() => Array(cols).fill(0));
        let dirs = [[-1, 0], [0, 1], [1, 0], [0, -1]]; // 0: Up, 1: Right, 2: Down, 3: Left
        
        for (let r = 0; r < rows; r++) {
            for (let c = 0; c < cols; c++) {
                if (grid[r][c] === 'goal' || grid[r][c] === 'obstacle') continue;
                
                let Q_values = [];
                for (let a = 0; a < 4; a++) {
                    let transitions = [
                        [a, 1.0 - 2.0 * noise],
                        [(a + 3) % 4, noise], // Same as (a - 1) % 4 in positive domain
                        [(a + 1) % 4, noise]
                    ];
                    
                    let expected_value = 0.0;
                    for (let tr of transitions) {
                        let act_dir = tr[0];
                        let prob = tr[1];
                        if (prob === 0) continue;
                        
                        let dr = dirs[act_dir][0];
                        let dc = dirs[act_dir][1];
                        let nr = r + dr;
                        let nc = c + dc;
                        
                        let next_v;
                        if (nr >= 0 && nr < rows && nc >= 0 && nc < cols && grid[nr][nc] !== 'obstacle') {
                            next_v = V[nr][nc];
                        } else {
                            next_v = V[r][c]; // Bump into wall/obstacle
                        }
                        
                        expected_value += prob * (step_reward + gamma * next_v);
                    }
                    Q_values.push(expected_value);
                }
                
                let maxQ = Math.max(...Q_values);
                newV[r][c] = maxQ;
                policy[r][c] = Q_values.indexOf(maxQ);
            }
        }
        
        let delta = 0;
        for(let r=0; r<rows; r++) {
            for(let c=0; c<cols; c++) {
                let diff = Math.abs(newV[r][c] - V[r][c]);
                if (diff > delta) delta = diff;
            }
        }
        
        return { V: newV, policy: policy, delta: delta };
    }

    function doStep(callback) {
        let payload = {
            grid: gridData,
            noise: parseFloat($('#noise').val()),
            gamma: parseFloat($('#gamma').val()),
            step_reward: parseFloat($('#step_reward').val()),
            V: VData
        };

        try {
            let res = calculateRLStep(payload.grid, payload.noise, payload.gamma, payload.step_reward, payload.V);
            VData = res.V;
            policyData = res.policy;
            iteration++;
            $('#iteration-count').text(iteration);
            $('#delta-value').text(res.delta.toFixed(4));
            renderGrid();
            if (callback) callback(res.delta);
        } catch (err) {
            console.error("Error calculating RL step", err);
            isRunning = false;
        }
    }

    function runToConvergence() {
        if (isRunning) return;
        isRunning = true;
        $('#btn-run').text('停止執行').removeClass('success').addClass('danger');
        
        function loop() {
            if (!isRunning) return;
            doStep(function(delta) {
                if (delta < 0.0001 || !isRunning) {
                    isRunning = false;
                    $('#btn-run').text('執行至收斂').addClass('success').removeClass('danger');
                } else {
                    setTimeout(loop, 40);
                }
            });
        }
        loop();
    }

    $('#btn-step').click(() => { isRunning = false; doStep(); });
    $('#btn-run').click(() => {
        if (isRunning) {
            isRunning = false;
            $('#btn-run').text('執行至收斂').addClass('success').removeClass('danger');
        } else {
            runToConvergence();
        }
    });

    $('#btn-reset-v').click(() => { resetV(); });
    $('#btn-clear-path').click(() => { clearPath(); });

    function clearPath() {
        let svg = document.getElementById('path-layer');
        while (svg.firstChild) {
            svg.removeChild(svg.firstChild);
        }
        
        // Re-add defs
        let defs = document.createElementNS("http://www.w3.org/2000/svg", "defs");
        let marker = document.createElementNS("http://www.w3.org/2000/svg", "marker");
        marker.setAttribute("id", "arrowhead");
        marker.setAttribute("markerWidth", "10");
        marker.setAttribute("markerHeight", "7");
        marker.setAttribute("refX", "9");
        marker.setAttribute("refY", "3.5");
        marker.setAttribute("orient", "auto");
        let polygon = document.createElementNS("http://www.w3.org/2000/svg", "polygon");
        polygon.setAttribute("points", "0 0, 10 3.5, 0 7");
        polygon.setAttribute("fill", "#fbbf24");
        marker.appendChild(polygon);
        defs.appendChild(marker);
        svg.appendChild(defs);
    }

    // Init defs once
    clearPath();

    $('#btn-draw-path').click(() => {
        if (!policyData) return alert("請先執行價值迭代！");
        clearPath();
        
        let startCell = null;
        for(let r=0; r<n; r++) for(let c=0; c<n; c++) if(gridData[r][c] === 'start') startCell = {r, c};
        
        if (!startCell) return alert("請先在網格上設置起點！");
        
        let path = [startCell];
        let curr = startCell;
        let maxSteps = n * n * 2;
        let steps = 0;
        let visited = new Set();
        
        while (steps < maxSteps) {
            let r = curr.r, c = curr.c;
            if (gridData[r][c] === 'goal') break;
            
            let key = `${r},${c}`;
            if (visited.has(key)) {
                console.log("Loop detected in path!");
                break;
            }
            visited.add(key);
            
            let a = policyData[r][c];
            let dirs = [[-1, 0], [0, 1], [1, 0], [0, -1]];
            let nr = r + dirs[a][0];
            let nc = c + dirs[a][1];
            
            if (nr < 0 || nr >= n || nc < 0 || nc >= n || gridData[nr][nc] === 'obstacle') {
                // Hitting wall, cannot proceed
                break;
            }
            
            curr = {r: nr, c: nc};
            path.push(curr);
            steps++;
        }
        
        drawPathLine(path);
    });

    function drawPathLine(path) {
        if (path.length < 2) return;
        let svg = document.getElementById('path-layer');
        let cellW = svg.clientWidth / n;
        let cellH = svg.clientHeight / n;
        
        let pts = path.map(p => {
            let cx = p.c * cellW + cellW / 2;
            let cy = p.r * cellH + cellH / 2;
            return `${cx},${cy}`;
        }).join(" ");
        
        let polyline = document.createElementNS("http://www.w3.org/2000/svg", "polyline");
        polyline.setAttribute("points", pts);
        polyline.setAttribute("fill", "none");
        polyline.setAttribute("stroke", "#fbbf24");
        polyline.setAttribute("stroke-width", "4");
        polyline.setAttribute("stroke-dasharray", "8,4");
        polyline.setAttribute("marker-end", "url(#arrowhead)");
        
        svg.appendChild(polyline);
    }
});
