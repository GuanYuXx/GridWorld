# GridWorld RL (Value Iteration)

![GridWorld Demo](demo_file/demo_main.gif)

## Overview
This project implements a GridWorld environment to demonstrate the core concepts of Reinforcement Learning (RL), specifically focusing on **Value Iteration**. Users can interactively design their own GridWorld by placing a start point, goals, traps, and obstacles. The application visualizes how the State Value Function ($V$) and the corresponding Policy ($\pi$) evolve iteratively based on the Markov Decision Process (MDP) parameters such as Discount Factor ($\gamma$), Transition Noise, and Step Reward. 

## Project Structure
```
GridWorld/
│
├── app.py                 # Flask web server and backend logic for RL calculations
├── demo_file/             # Directory containing demonstrations and reference materials
│   └── Demo.mp4           # Demonstration video of the application
│   └── HW_request.png     # Original homework/project request image
│   └── new2Grid_World_RL_Blueprint.pdf # Reference documentation
│   └── QA_record.md       # Q&A record explaining core mechanics (Noise, Step Reward)
├── static/                # Static assets for the frontend
│   ├── script.js          # Interactive frontend logic and AJAX calls
│   └── style.css          # Styling for the application
└── templates/             # HTML templates
    └── index.html         # Main user interface layout
```

## Key Features
1. **Interactive Grid Editor**: Click and drag to place the Start state, Goals (+10), Traps (-10), and Obstacles on a configurable $N \times N$ grid.
2. **Adjustable MDP Parameters**: 
    - **Discount Factor ($\gamma$)**: Determines the importance of future rewards.
    - **Transition Noise ($b$)**: Simulates a slippery environment where the agent has a probability $b$ of moving perpendicular to its intended direction.
    - **Step Reward**: A constant reward (usually negative, e.g., -1.0) given for every step taken to encourage finding the shortest path.
3. **Real-time Value Iteration Visualization**: 
    - Execute value iteration step-by-step or run it until convergence. 
    - Observe how values propagate through the grid and how the optimal policy updates dynamically.
4. **Policy Extraction & Pathfinding**: Once the optimal policy is computed, the application can extract and draw the optimal path from the Start state to the Goal.

## 環境需求 (Environment Requirements)
此專案採用 Python Flask 作為後端伺服器處理「價值迭代算法」數學運算。若開發者欲進行源碼修改或使用 Docker 容器化技術發布，建議具備以下環境版本：
*   **Python**: 3.8+ (核心必備，運行 Flask 伺服器與後端 RL 引擎)
*   **HTML5 / CSS3 / JavaScript**: (ES6+ 標準，用於前端動態網格互動)
*   **Java**: 11+ (若未來需擴充 Java Backend 模組)

主要依賴套件可參考 `requirements.txt`：
*   `Flask`
*   `numpy`

## Demo

[GridWorld NxN **the number of grid < n-2** ](https://guanyuxx.github.io/GridWorld/)

## Repository
[https://github.com/GuanYuXx/GridWorld](https://github.com/GuanYuXx/GridWorld)
