// Story configuration
const story = [
    {
        text: "You wake up in a mysterious room. The walls are covered with strange symbols, and there's a faint humming sound in the distance.\n\nYou notice a control panel on the wall with three buttons.",
        interaction: {
            type: "dropdown",
            label: "Which button do you press?",
            options: ["Red Button", "Blue Button", "Green Button"],
            variable: "buttonChoice"
        }
    },
    {
        text: (vars) => {
            if (vars.buttonChoice === "Red Button") {
                return "The red button glows as you press it. Suddenly, a holographic display appears before you.\n\n'Welcome, traveler. You must schedule your departure.'";
            } else if (vars.buttonChoice === "Blue Button") {
                return "The blue button clicks softly. A calming melody fills the room, and a screen emerges from the floor.\n\n'Time is of the essence. When shall you begin your journey?'";
            } else {
                return "The green button pulses with energy. The room illuminates, revealing a navigation console.\n\n'Coordinates locked. Select your destination date.'";
            }
        },
        interaction: {
            type: "date",
            label: "Choose a date:",
            variable: "selectedDate"
        }
    },
    {
        text: (vars) => {
            return `You've selected ${vars.selectedDate}. The machine whirs to life.\n\nA voice asks: "How many companions will join you on this journey?"`;
        },
        interaction: {
            type: "number",
            label: "Enter number of companions (0-10):",
            min: 0,
            max: 10,
            variable: "companions"
        }
    },
    {
        text: (vars) => {
            const companionText = vars.companions == 1 ? "companion" : "companions";
            return `With ${vars.companions} ${companionText} by your side, you prepare for the journey.\n\nBefore you go, you must enter your name into the ship's log.`;
        },
        interaction: {
            type: "text",
            label: "Enter your name:",
            variable: "playerName"
        }
    },
    {
        text: (vars) => {
            return `"Welcome aboard, ${vars.playerName}."\n\nThe systems are now fully initialized. Your journey begins on ${vars.selectedDate} with ${vars.companions} companion(s).\n\nThe door slides open, revealing a corridor of infinite possibilities.\n\nWhat will you do?`;
        },
        interaction: {
            type: "dropdown",
            label: "Choose your action:",
            options: ["Step into the corridor", "Examine the room further", "Return to sleep"],
            variable: "finalChoice"
        }
    },
    {
        text: (vars) => {
            if (vars.finalChoice === "Step into the corridor") {
                return `You step forward into the unknown, ${vars.playerName}. The adventure begins...\n\n[END OF PROTOTYPE]`;
            } else if (vars.finalChoice === "Examine the room further") {
                return `You decide to investigate further. As you search, you discover ancient writings that tell of others who came before you...\n\n[END OF PROTOTYPE]`;
            } else {
                return `You return to the sleeping pod. Perhaps another day, ${vars.playerName}. Perhaps another day...\n\n[END OF PROTOTYPE]`;
            }
        },
        interaction: null
    }
];

// Game state
let currentStoryIndex = 0;
let storyVariables = {};
let isTyping = false;

// DOM elements
const storyTextElement = document.getElementById('story-text');
const interactionContainer = document.getElementById('interaction-container');

// Typing effect
function typeText(text, element, speed = 30) {
    return new Promise((resolve) => {
        element.textContent = '';
        let index = 0;
        isTyping = true;

        function type() {
            if (index < text.length) {
                element.textContent += text.charAt(index);
                index++;
                setTimeout(type, speed);
            } else {
                isTyping = false;
                resolve();
            }
        }

        type();
    });
}

// Create interaction UI elements
function createInteraction(interaction) {
    interactionContainer.innerHTML = '';
    
    if (!interaction) {
        return;
    }

    const wrapper = document.createElement('div');
    wrapper.className = 'fade-in';

    if (interaction.label) {
        const label = document.createElement('div');
        label.className = 'interaction-label';
        label.textContent = interaction.label;
        wrapper.appendChild(label);
    }

    let inputElement;
    let submitButton;

    switch (interaction.type) {
        case 'dropdown':
            inputElement = document.createElement('select');
            inputElement.innerHTML = '<option value="">-- Select an option --</option>';
            interaction.options.forEach(option => {
                const optionElement = document.createElement('option');
                optionElement.value = option;
                optionElement.textContent = option;
                inputElement.appendChild(optionElement);
            });
            
            submitButton = document.createElement('button');
            submitButton.textContent = 'Continue';
            submitButton.disabled = true;
            
            inputElement.addEventListener('change', (e) => {
                submitButton.disabled = e.target.value === '';
            });
            
            submitButton.addEventListener('click', () => {
                if (inputElement.value) {
                    handleInteraction(interaction.variable, inputElement.value);
                }
            });
            break;

        case 'date':
            inputElement = document.createElement('input');
            inputElement.type = 'date';
            inputElement.min = '2024-01-01';
            inputElement.max = '2099-12-31';
            
            submitButton = document.createElement('button');
            submitButton.textContent = 'Continue';
            submitButton.disabled = true;
            
            inputElement.addEventListener('change', (e) => {
                submitButton.disabled = !e.target.value;
            });
            
            submitButton.addEventListener('click', () => {
                if (inputElement.value) {
                    handleInteraction(interaction.variable, inputElement.value);
                }
            });
            break;

        case 'time':
            inputElement = document.createElement('input');
            inputElement.type = 'time';
            
            submitButton = document.createElement('button');
            submitButton.textContent = 'Continue';
            submitButton.disabled = true;
            
            inputElement.addEventListener('change', (e) => {
                submitButton.disabled = !e.target.value;
            });
            
            submitButton.addEventListener('click', () => {
                if (inputElement.value) {
                    handleInteraction(interaction.variable, inputElement.value);
                }
            });
            break;

        case 'text':
            inputElement = document.createElement('input');
            inputElement.type = 'text';
            inputElement.placeholder = 'Type here...';
            
            submitButton = document.createElement('button');
            submitButton.textContent = 'Continue';
            submitButton.disabled = true;
            
            inputElement.addEventListener('input', (e) => {
                submitButton.disabled = e.target.value.trim() === '';
            });
            
            inputElement.addEventListener('keypress', (e) => {
                if (e.key === 'Enter' && inputElement.value.trim()) {
                    handleInteraction(interaction.variable, inputElement.value.trim());
                }
            });
            
            submitButton.addEventListener('click', () => {
                if (inputElement.value.trim()) {
                    handleInteraction(interaction.variable, inputElement.value.trim());
                }
            });
            break;

        case 'number':
            inputElement = document.createElement('input');
            inputElement.type = 'number';
            inputElement.min = interaction.min || 0;
            inputElement.max = interaction.max || 100;
            inputElement.value = interaction.min || 0;
            
            submitButton = document.createElement('button');
            submitButton.textContent = 'Continue';
            
            submitButton.addEventListener('click', () => {
                const value = parseInt(inputElement.value);
                if (!isNaN(value)) {
                    handleInteraction(interaction.variable, value);
                }
            });
            break;
    }

    wrapper.appendChild(inputElement);
    wrapper.appendChild(submitButton);
    interactionContainer.appendChild(wrapper);
    
    // Focus on the input element
    setTimeout(() => inputElement.focus(), 100);
}

// Handle user interaction
function handleInteraction(variable, value) {
    storyVariables[variable] = value;
    currentStoryIndex++;
    displayStory();
}

// Display current story segment
async function displayStory() {
    if (currentStoryIndex >= story.length) {
        return;
    }

    const currentStory = story[currentStoryIndex];
    let text = typeof currentStory.text === 'function' 
        ? currentStory.text(storyVariables) 
        : currentStory.text;

    // Clear interaction while typing
    interactionContainer.innerHTML = '';

    // Type the text
    await typeText(text, storyTextElement);

    // Show interaction after text is done
    if (currentStory.interaction) {
        createInteraction(currentStory.interaction);
    }
}

// Start the game
displayStory();

