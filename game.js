let actionsSinceLastRest = 0;
const restCooldown = 3;

// Define the player object with health, damage, inventory, and skills
const player = {
    health: 100,
    maxHealth: 100,
    radiation: 0,
    maxRadiation: 40,
    damage: 10,
    inventory: [],
    skills: {
        stealth: 0,
        combat: 0
    }
};

function randomScenario() {
    const scenarios = ['findItem', 'encounter'];
    const randomIndex = Math.floor(Math.random() * scenarios.length);
    showScenario(scenarios[randomIndex]);
}

const items = {
    'Health Potion': {
        type: 'consumable',
        effect: (player) => {
            player.health = Math.min(player.maxHealth, player.health + 30);
            return `You used a Health Potion and restored 30 HP.`;
        }
    },
    'Rad-Away': {
        type: 'consumable',
        effect: (player) => {
            player.radiation = Math.max(0, player.radiation - 15);
            return `You used Rad-Away and reduced your radiation by 15.`;
        }
    },
    'Steel Sword': {
        type: 'consumable',
        effect: (player) => {
            player.damage += 5;
            return `You equipped the Steel Sword. Your damage increased by 5.`;
        }
    },
    'Healing Herb': {
        type: 'consumable',
        effect: (player) => {
            player.health = Math.min(player.maxHealth, player.health + 15);
            return `You used a Healing Herb and restored 15 HP.`;
        }
    }
};

// Define a monster object
let monster = null;

// Keep track of the current scenario
let currentScenario = 'start';

// Function to update player stats on the screen
function updateStats() {
    document.getElementById('health-display').textContent = `Health: ${player.health}/${player.maxHealth}`;
    document.getElementById('radiation-display').textContent = `Radiation: ${player.radiation}/${player.maxRadiation}`;
    document.getElementById('damage-display').textContent = `Damage: ${player.damage}`;
    document.getElementById('inventory-display').textContent = `Inventory: ${player.inventory.length ? player.inventory.join(', ') : 'None'}`;
    document.getElementById('skills-display').textContent = `Skills: Stealth (${player.skills.stealth}), Combat (${player.skills.combat})`;
    updateActionButtons();

    const combatButtons = document.querySelectorAll('.combat-btn');
    combatButtons.forEach(button => {
        button.style.display = inCombat ? 'inline-block' : 'none';
    });
}

// Function to create a monster
function createMonster(name, health, damage) {
    return { name, health, maxHealth: health, damage };
}

const monsters = [
    { name: 'Glowling', health: 10, damage: 3 },
    { name: 'Radfang', health: 30, damage: 5 },
    { name: 'Radroach', health: 50, damage: 10 },
    { name: 'Nuclearon', health: 75, damage: 12 }
];

function createRandomMonster() {
    const randomIndex = Math.floor(Math.random() * monsters.length);
    const monsterData = monsters[randomIndex];
    inCombat = true;
    return createMonster(monsterData.name, monsterData.health, monsterData.damage);
}

function createSpecificMonster(monsterName) {
    const monsterData = monsters.find(m => m.name.toLowerCase() === monsterName.toLowerCase());
    if (monsterData) {
        return createMonster(monsterData.name, monsterData.health, monsterData.damage);
    }
    return null;
}

// Define the scenarios as an object
const scenarios = {
    start: {
        text: 'You wake up in a mysterious forest. There is a path to the left and another to the right.',
        choices: [
            { text: 'Go left', next: 'leftPath' },
            { text: 'Go right', next: 'rightPath' },
            { text: 'Obunga', next: 'dangerousPath' }
        ]
    },
    leftPath: {
        text: 'You encounter a river. There\'s a bridge, but it looks unstable.',
        choices: [
            { text: 'Cross the bridge and risk losing health', next: 'crossBridge' },
            { text: 'Go back', next: 'start' }
        ]
    },
    crossBridge: {
        text: 'The bridge collapses! You lose 10 health and gain 10 radiation.',
        effect: (player) => {
            player.health = Math.max(0, player.health - 10);
            player.radiation = Math.min(player.maxRadiation, player.radiation + 10);
            return `You lost 10 health and gained 10 radiation.`;
        },
        choices: [
            { text: 'Swim to shore', next: 'riverbank' }
        ]
    },
    riverbank: {
        text: 'You made it to the shore. You find a healing herb.',
        choices: [
            { text: 'Pick up the herb', next: 'start', items: ['Healing Herb'] },
            { text: 'Leave it', next: 'start' }
        ]
    },
    rightPath: {
        text: 'You see a small village in the distance.',
        choices: [
            { text: 'Approach the village', next: 'village' },
            { text: 'Stay hidden and observe', next: 'observeVillage' }
        ]
    },
    village: {
        text: 'You enter the village and find an old man who offers you a health potion.',
        choices: [
            { text: 'Accept the potion', next: 'start', items: ['Health Potion'] },
            { text: 'Decline politely', next: 'start' }
        ]
    },
    observeVillage: {
        text: 'You watch the villagers. They seem friendly.',
        choices: [
            { text: 'Join the villagers', next: 'village' },
            { text: 'Leave quietly', next: 'start' }
        ]
    },
    dangerousPath: {
        text: 'You come across a dangerous-looking path. There are signs of a powerful creature nearby.',
        choices: [
            { text: 'Explore the cave', next: 'encounter', monster: 'Radfang' },
            { text: 'Take a random path', next: 'encounter' },
            { text: 'Proceed cautiously', next: 'encounter', monster: 'Nuclearon' },
            { text: 'Take a safer route', next: 'start' }
        ]
    },
    findItem: {
        text: 'You find a chest containing valuable items!',
        choices: [
            { text: 'Take the items', next: 'start', items: ['Health Potion', 'Rad-Away', 'Steel Sword'] },
            { text: 'Leave them', next: 'start' }
        ]
    },
    takeItems: {
        text: 'You carefully open the chest and take the items.',
        effect: () => {
            player.inventory.push('Health Potion', 'Rad-Away', 'Steel Sword');
            updateStats();
        },
        choices: [
            { text: 'Continue', next: 'start' }
        ]
    },
    encounter: {
        text: 'A wild monster appears!',
        effect: (player, specificMonster) => {
            if (specificMonster) {
                monster = createSpecificMonster(specificMonster);
            } else {
                monster = createRandomMonster();
            }
            inCombat = true;
            return `You've encountered a ${monster.name} (HP: ${monster.health}/${monster.maxHealth}, Damage: ${monster.damage})!`;
        },
        choices: [
            { text: 'Fight', next: 'combat' },
            { text: 'Try to flee', next: 'flee' }
        ]
    },
    combat: {
        text: '',
        effect: () => {
            return `${monster.name} (HP: ${monster.health}/${monster.maxHealth}) is ready to fight!`;
        },
        choices: [
            { text: 'Attack', next: 'playerAttack' },
            { text: 'Try to flee', next: 'flee' }
        ]
    },
    flee: {
        text: 'You attempt to flee...',
        effect: () => {
            if (Math.random() < 0.5 + player.skills.stealth * 0.1) {
                player.skills.stealth += 1;
                inCombat = false;
                monster = null;
                return 'You successfully fled from the battle!';
            } else {
                const damage = Math.max(0, monster.damage - Math.floor(player.skills.combat / 2));
                player.health = Math.max(0, player.health - damage);
                return `You failed to flee. The ${monster.name} attacks and deals ${damage} damage!`;
            }
        },
        choices: [
            { text: 'Continue', next: 'fleeResult' }
        ]
    },
    fleeResult: {
        text: '',
        effect: () => {
            if (inCombat) {
                return 'You failed to flee. The battle continues!';
            } else {
                return 'You successfully fled from the battle!';
            }
        },
        choices: [
            { text: 'Continue', next: 'fleeResult' }
        ]
    },
    playerAttack: {
        text: '',
        effect: () => {
            monster.health = Math.max(0, monster.health - player.damage);
            const message = `You hit the ${monster.name} for ${player.damage} damage.`;
            if (monster.health <= 0) {
                return message + ` You defeated the ${monster.name}!`;
            }
            return message + ` ${monster.name} has ${monster.health}/${monster.maxHealth} HP left.`;
        },
        choices: [
            { text: 'Continue', next: 'monsterAttack' }
        ]
    },
    monsterAttack: {
        text: '',
        effect: () => {
            const monsterDamage = Math.max(0, monster.damage - Math.floor(player.skills.combat / 2));
            player.health = Math.max(0, player.health - monsterDamage);
            const message = `The ${monster.name} hits you for ${monsterDamage} damage.`;
            if (player.health <= 0) {
                return message + ' You were defeated in battle!';
            }
            return message + ` You have ${player.health}/${player.maxHealth} HP left.`;
        },
        choices: [
            { text: 'Continue', next: 'combat' }
        ]
    },
    combatUseItem: {
        text: 'Choose an item to use:',
        choices: [] // This will be populated dynamically
    },
    gameOver: {
        text: 'Your health has reached 0. Game Over!',
        choices: [
            { text: 'Restart Game', next: 'start' }
        ],
        effect: () => {
            // Reset player stats
            player.health = player.maxHealth;
            player.radiation = 0;
            player.inventory = [];
            player.skills.stealth = 0;
            player.skills.combat = 0;
        }
    }
};



let previousScenario = 'start';

function showScenario(scenarioKey, specificMonster = null) {
    if (scenarioKey !== 'combat' && scenarioKey !== 'playerAttack' && scenarioKey !== 'monsterAttack' && scenarioKey !== 'flee' && scenarioKey !== 'fleeResult' && scenarioKey !== 'encounter') {
        previousScenario = scenarioKey;
    }

    currentScenario = scenarioKey;
    const scenario = scenarios[scenarioKey];
    
    let effectMessage = '';
    if (scenario.effect) {
        effectMessage = scenario.effect(player, specificMonster);
    }

    document.getElementById('story-text').textContent = scenario.text + (effectMessage ? ' ' + effectMessage : '');
    const choiceContainer = document.getElementById('choice-container');
    choiceContainer.innerHTML = '';

    if (scenarioKey === 'combatUseItem') {
        // ... (combatUseItem handling remains the same)
    } else {
        scenario.choices.forEach(choice => {
            const button = document.createElement('button');
            button.textContent = choice.text;
            button.classList.add('choice-btn');
            button.onclick = () => {
                actionsSinceLastRest++;
                
                if (choice.items) {
                    choice.items.forEach(item => {
                        player.inventory.push(item);
                        alert(`You received: ${item}`);
                    });
                }

                updateStats();
                
                if (player.health <= 0) {
                    showScenario('gameOver');
                } else if (monster && monster.health <= 0) {
                    player.skills.combat += 1;
                    monster = null;
                    inCombat = false;
                    showScenario(previousScenario);
                } else if (choice.next === 'fleeResult') {
                    if (inCombat) {
                        showScenario('combat');
                    } else {
                        showScenario(previousScenario);
                    }
                } else if (choice.next === 'encounter' && choice.monster) {
                    showScenario('encounter', choice.monster);
                } else if (!inCombat && Math.random() < 0.3) {
                    showScenario('encounter');
                } else {
                    showScenario(choice.next);
                }
            };
            choiceContainer.appendChild(button);
        });
    }

    updateStats();
}

function randomScenario() {
    if (inCombat) {
        showScenario('combat');
    } else {
        const scenarios = ['findItem', 'encounter'];
        const randomIndex = Math.floor(Math.random() * scenarios.length);
        showScenario(scenarios[randomIndex]);
    }
}

let inCombat = false;

// Function to use an item
function useItem(itemName) {
    const item = items[itemName];
    if (!item) {
        console.error(`Item not found: ${itemName}`);
        return;
    }

    const index = player.inventory.indexOf(itemName);
    if (index > -1) {
        const message = item.effect(player);
        if (item.type === 'consumable') {
            player.inventory.splice(index, 1);
        }
        alert(message);
        actionsSinceLastRest++; // Increment action counter when using an item
        updateStats();
        showScenario(currentScenario);
    } else {
        console.error(`Item not in inventory: ${itemName}`);
    }
}

// Function to update action buttons
function updateActionButtons() {
    const actionContainer = document.getElementById('action-buttons');
    actionContainer.innerHTML = ''; // Clear previous buttons

    // Add the "Random Event" button
    const randomButton = document.createElement('button');
    randomButton.textContent = 'Random Event';
    randomButton.onclick = () => {
        actionsSinceLastRest++;
        randomScenario();
    };
    actionContainer.appendChild(randomButton);

    // Add buttons for each item in inventory
    player.inventory.forEach(item => {
        const button = document.createElement('button');
        button.textContent = `Use ${item}`;
        button.onclick = () => {
            actionsSinceLastRest++;
            useItem(item);
        };
        actionContainer.appendChild(button);
    });

    // Add a "Rest" button if player's health is not full and cooldown has passed
    if (player.health < player.maxHealth) {
        const restButton = document.createElement('button');
        if (actionsSinceLastRest >= restCooldown) {
            restButton.textContent = 'Rest';
            restButton.onclick = () => {
                player.health = Math.min(player.maxHealth, player.health + 10);
                alert('You rested and recovered 10 HP.');
                actionsSinceLastRest = 0;
                updateStats();
                showScenario(currentScenario);
            };
        } else {
            restButton.textContent = `Rest (${restCooldown - actionsSinceLastRest} actions left)`;
            restButton.disabled = true;
        }
        actionContainer.appendChild(restButton);
    }
}function updateActionButtons() {
    const actionContainer = document.getElementById('action-buttons');
    actionContainer.innerHTML = ''; // Clear previous buttons

    // Add the "Random Event" button
    const randomButton = document.createElement('button');
    randomButton.textContent = 'Random Event';
    randomButton.onclick = () => {
        actionsSinceLastRest++;
        randomScenario();
    };
    actionContainer.appendChild(randomButton);

    // Add buttons for each item in inventory
    player.inventory.forEach(item => {
        const button = document.createElement('button');
        button.textContent = `Use ${item}`;
        button.onclick = () => {
            actionsSinceLastRest++;
            useItem(item);
        };
        actionContainer.appendChild(button);
    });

    // Add a "Rest" button if player's health is not full and cooldown has passed
    if (player.health < player.maxHealth) {
        const restButton = document.createElement('button');
        if (actionsSinceLastRest >= restCooldown) {
            restButton.textContent = 'Rest';
            restButton.onclick = () => {
                player.health = Math.min(player.maxHealth, player.health + 10);
                alert('You rested and recovered 10 HP.');
                actionsSinceLastRest = 0;
                updateStats();
                showScenario(currentScenario);
            };
        } else {
            restButton.textContent = `Rest (${restCooldown - actionsSinceLastRest} actions left)`;
            restButton.disabled = true;
        }
        actionContainer.appendChild(restButton);
    }
}

// Initialize the game and show the starting scenario
function initGame() {
    updateStats(); // Initial player stats display
    showScenario('start'); // Start the game
}

// Start the game when the page loads
window.onload = initGame;