document.addEventListener('DOMContentLoaded', () => {
    // --- DOM Elements ---
    const screens = {
        start: document.getElementById('start-screen'),
        nextPlayer: document.getElementById('next-player-screen'),
        question: document.getElementById('question-screen'),
        discussion: document.getElementById('discussion-screen'),
        voting: document.getElementById('voting-screen'),
        final: document.getElementById('final-screen'),
    };

    const playerNamesInput = document.getElementById('player-names-input');
    const startGameButton = document.getElementById('start-game-button');
    const startError = document.getElementById('start-error');

    const nextPlayerMessage = document.getElementById('next-player-message');
    const nextPlayerButton = document.getElementById('next-player-button');

    const questionPlayerName = document.getElementById('question-player-name');
    const questionText = document.getElementById('question-text');
    const answerInput = document.getElementById('answer-input');
    const submitAnswerButton = document.getElementById('submit-answer-button');
    const answerError = document.getElementById('answer-error');

    const discussionQuestion = document.getElementById('discussion-question');
    const discussionAnswersList = document.getElementById('discussion-answers');
    const proceedToVotingButton = document.getElementById('proceed-to-voting-button');

    const votingPlayerName = document.getElementById('voting-player-name');
    const votingOptionsDiv = document.getElementById('voting-options');
    const submitVoteButton = document.getElementById('submit-vote-button');
    const voteError = document.getElementById('vote-error');

    const impostorReveal = document.getElementById('impostor-reveal');
    const resultsVotesList = document.getElementById('results-votes');
    const winnerMessage = document.getElementById('winner-message');
    const playAgainButton = document.getElementById('play-again-button');

    // --- Game State ---
    let players = []; // { name: string, answer: string, votesReceived: number, isImpostor: boolean }
    let questions = [];
    let currentQuestionPair = null; // { official: string, impostor: string }
    let impostorIndex = -1;
    let currentPlayerIndex = 0;
    let gameState = 'setup'; // 'setup', 'asking', 'discussing', 'voting', 'results'
    let currentVotes = {}; // { voterName: votedForName }

    // --- Functions ---

    // Utility to show/hide screens
    function showScreen(screenId) {
        Object.values(screens).forEach(screen => screen.classList.remove('active'));
        screens[screenId].classList.add('active');
        console.log(`Switching to screen: ${screenId}`); // Debugging
    }

    // Fisher-Yates (Knuth) Shuffle
    function shuffleArray(array) {
        for (let i = array.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]];
        }
    }

    async function loadQuestions() {
        try {
            const response = await fetch('questions.json');
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            questions = await response.json();
            console.log("Questions loaded:", questions);
            if (!Array.isArray(questions) || questions.length === 0) {
                 console.error("Loaded questions data is not a valid non-empty array.");
                 startError.textContent = "Error: Could not load valid questions.";
                 questions = []; // Ensure it's an empty array if invalid
            }
        } catch (error) {
            console.error("Failed to load questions:", error);
            startError.textContent = "Error loading questions. Please check questions.json and refresh.";
            questions = []; // Ensure it's an empty array on error
        }
    }


    function startGame() {
        startError.textContent = ''; // Clear previous errors
        const namesRaw = playerNamesInput.value.trim();
        if (!namesRaw) {
            startError.textContent = 'Please enter player names.';
            return;
        }

        // Split by newline or comma, trim whitespace, filter empty names
        const potentialNames = namesRaw.split(/[\n,]/).map(name => name.trim()).filter(name => name);

        if (potentialNames.length < 3) {
            startError.textContent = 'You need at least 3 players.';
            return;
        }

        // Check for duplicate names
        const uniqueNames = new Set(potentialNames);
        if (uniqueNames.size !== potentialNames.length) {
            startError.textContent = 'Player names must be unique.';
            return;
        }

        if (questions.length === 0) {
            startError.textContent = 'No questions loaded. Cannot start game.';
            // Attempt to load again in case it failed silently before
            loadQuestions().then(() => {
                if (questions.length > 0) startGame(); // Retry if load succeeds now
                else startError.textContent = 'Still no questions loaded. Check questions.json.';
            });
            return;
        }


        players = potentialNames.map(name => ({ name: name, answer: '', votesReceived: 0, isImpostor: false }));
        shuffleArray(players); // Randomize player order initially

        // Select random question pair
        currentQuestionPair = questions[Math.floor(Math.random() * questions.length)];

        // Select random impostor
        impostorIndex = Math.floor(Math.random() * players.length);
        players[impostorIndex].isImpostor = true;

        console.log("Game Started. Players:", players);
        console.log("Selected Question Pair:", currentQuestionPair);
        console.log("Impostor:", players[impostorIndex].name);


        currentPlayerIndex = 0;
        gameState = 'asking';
        promptNextPlayer();
    }

    function promptNextPlayer() {
        if (gameState === 'asking') {
            if (currentPlayerIndex < players.length) {
                nextPlayerMessage.textContent = `Pass the device to ${players[currentPlayerIndex].name}.`;
                nextPlayerButton.textContent = "Show My Question";
                showScreen('nextPlayer');
            } else {
                // All answers collected, move to discussion
                gameState = 'discussing';
                showDiscussion();
            }
        } else if (gameState === 'voting') {
             if (currentPlayerIndex < players.length) {
                nextPlayerMessage.textContent = `Pass the device to ${players[currentPlayerIndex].name} for voting.`;
                nextPlayerButton.textContent = "Start Voting";
                showScreen('nextPlayer');
            } else {
                // All votes collected, move to results
                gameState = 'results';
                calculateResults();
                showResults();
            }
        }
    }

     function handleNextPlayerButton() {
        if (gameState === 'asking') {
            showQuestion();
        } else if (gameState === 'voting') {
            showVotingOptions();
        }
    }


    function showQuestion() {
        const currentPlayer = players[currentPlayerIndex];
        questionPlayerName.textContent = currentPlayer.name;
        questionText.textContent = currentPlayer.isImpostor ? currentQuestionPair.impostor : currentQuestionPair.official;
        answerInput.value = ''; // Clear previous answer
        answerError.textContent = ''; // Clear previous error
        showScreen('question');
        answerInput.focus(); // Focus the input field
    }

    function submitAnswer() {
        const answer = answerInput.value.trim();
        if (!answer) {
            answerError.textContent = 'Please enter an answer.';
            return;
        }
        answerError.textContent = ''; // Clear error

        players[currentPlayerIndex].answer = answer;
        console.log(`${players[currentPlayerIndex].name} answered: ${answer}`);

        currentPlayerIndex++;
        promptNextPlayer(); // Move to next player or discussion
    }

    function showDiscussion() {
        discussionQuestion.textContent = currentQuestionPair.official;

        discussionAnswersList.innerHTML = ''; // Clear previous list
        // Display each player's name and answer
        players.forEach(player => {
            const li = document.createElement('li');
            li.textContent = `${player.name}: ${player.answer}`; // Show name and answer
            discussionAnswersList.appendChild(li);
        });

        showScreen('discussion');
    }

     function startVoting() {
        gameState = 'voting';
        currentPlayerIndex = 0;
        currentVotes = {}; // Reset votes for the new round
        promptNextPlayer(); // Start the voting sequence
    }


    function showVotingOptions() {
        const currentPlayer = players[currentPlayerIndex];
        votingPlayerName.textContent = currentPlayer.name;
        voteError.textContent = ''; // Clear previous error

        votingOptionsDiv.innerHTML = ''; // Clear previous options
        players.forEach((player, index) => {
            // Players cannot vote for themselves
            if (index !== currentPlayerIndex) {
                const button = document.createElement('button');
                button.textContent = player.name;
                button.dataset.voteIndex = index; // Store the index of the player being voted for
                button.addEventListener('click', (e) => {
                     // Immediately record vote when button is clicked
                     const votedForIndex = parseInt(e.target.dataset.voteIndex);
                     const votedForName = players[votedForIndex].name;
                     currentVotes[currentPlayer.name] = votedForName;
                     console.log(`${currentPlayer.name} voted for ${votedForName}`);
                     submitVote(); // Proceed immediately after click
                });
                votingOptionsDiv.appendChild(button);
            }
        });

        // Hide the separate submit button as voting happens on name click
        submitVoteButton.style.display = 'none';

        showScreen('voting');
    }

    // This function is now just responsible for moving to the next voter or results
    function submitVote() {
        // Vote is already recorded in showVotingOptions via button click
        // Check if a vote was actually recorded for the current player before proceeding
        if (!currentVotes[players[currentPlayerIndex].name]) {
            // This case shouldn't happen with the current button logic, but good for safety
            voteError.textContent = 'An error occurred. Please try voting again.';
            console.error("SubmitVote called but no vote recorded for:", players[currentPlayerIndex].name);
            return; // Stay on the voting screen or handle error appropriately
        }
        voteError.textContent = ''; // Clear error

        currentPlayerIndex++;
        promptNextPlayer(); // Move to next voter or results
    }


    function calculateResults() {
        // Reset votes received count
        players.forEach(p => p.votesReceived = 0);

        // Tally votes
        Object.values(currentVotes).forEach(votedForName => {
            const targetPlayer = players.find(p => p.name === votedForName);
            if (targetPlayer) {
                targetPlayer.votesReceived++;
            }
        });
        console.log("Votes tallied:", players.map(p => ({ name: p.name, votes: p.votesReceived })));
    }

    function showResults() {
        const impostor = players[impostorIndex];
        impostorReveal.textContent = impostor.name;

        resultsVotesList.innerHTML = ''; // Clear previous results
        // Sort players by votes received (descending) for display clarity
        const sortedPlayers = [...players].sort((a, b) => b.votesReceived - a.votesReceived);

        let maxVotes = 0;
        sortedPlayers.forEach(player => {
            const li = document.createElement('li');
            li.textContent = `${player.name}: ${player.votesReceived} vote(s)`;
            resultsVotesList.appendChild(li);
            if (player.votesReceived > maxVotes) {
                maxVotes = player.votesReceived;
            }
        });

        // Determine winner
        if (impostor.votesReceived >= maxVotes && maxVotes > 0) {
             // Impostor got the most votes (or tied for most), Detectives win
             // Added maxVotes > 0 check to handle cases where no votes are cast correctly
            winnerMessage.textContent = "The Detectives Win! They found the Impostor.";
        } else {
            // Impostor did not get the most votes, Impostor wins
            winnerMessage.textContent = "The Impostor Wins! They escaped detection.";
        }

        showScreen('final');
    }

    function resetGame() {
        players = [];
        currentQuestionPair = null;
        impostorIndex = -1;
        currentPlayerIndex = 0;
        gameState = 'setup';
        currentVotes = {};
        playerNamesInput.value = ''; // Clear input field
        startError.textContent = '';
        answerError.textContent = '';
        voteError.textContent = '';
        // Don't reload questions, just reset state
        showScreen('start');
    }


    // --- Event Listeners ---
    startGameButton.addEventListener('click', startGame);
    nextPlayerButton.addEventListener('click', handleNextPlayerButton);
    submitAnswerButton.addEventListener('click', submitAnswer);
    // Allow submitting answer with Enter key
    answerInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            submitAnswer();
        }
    });
    proceedToVotingButton.addEventListener('click', startVoting);
    // submitVoteButton listener removed as voting happens on name click
    playAgainButton.addEventListener('click', resetGame);

    // --- Initial Load ---
    loadQuestions(); // Load questions when the script runs
    showScreen('start'); // Show the start screen initially

});
