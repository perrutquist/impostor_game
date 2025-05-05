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
    const languageSelect = document.getElementById('language-select');

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

    // Voting Screen Elements
    const votingPrompt = document.getElementById('voting-prompt'); // Get the h2 element
    const votingPlayerName = document.getElementById('voting-player-name'); // Span inside h2
    const votingOptionsDiv = document.getElementById('voting-options');
    const submitVoteButton = document.getElementById('submit-vote-button');
    const voteError = document.getElementById('vote-error');

    // Final Screen Elements
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
    let currentLanguage = 'en'; // Default language

    // --- Translations ---
    // Using {playerName}, {impostorName}, {voterName}, {votedForName} as placeholders
    const translations = {
        en: {
            gameTitle: "The Impostor Game",
            languageLabel: "Language:",
            playerNamesPrompt: "Enter player names (one per line or comma-separated):",
            playerNamesPlaceholder: "Alice\nBob\nCharlie",
            startGameButton: "Start Game",
            startErrorPlayerCount: "You need at least 3 players.",
            startErrorUniqueNames: "Player names must be unique.",
            startErrorNoNames: "Please enter player names.",
            startErrorNoQuestions: "No questions loaded. Cannot start game.",
            startErrorLoadingQuestions: "Error loading questions. Please check the questions file and refresh.",
            startErrorStillNoQuestions: "Still no questions loaded. Check questions file.",
            passDevicePrompt: "Pass the device to {playerName}.",
            nextPlayerButtonQuestion: "Show My Question",
            nextPlayerButtonVote: "Start Voting",
            questionPrompt: "Question for {playerName}:",
            answerPlaceholder: "Enter your answer",
            submitAnswerButton: "Submit Answer",
            answerError: "Please enter an answer.",
            discussionTitle: "Discussion Time!",
            officialQuestionLabel: "The Question Was:",
            answersGivenLabel: "Answers Given:",
            discussionInstructions: "Discuss the answers and try to identify the Impostor.",
            proceedToVotingButton: "Proceed to Voting",
            votingPromptImpostor: "{playerName}, whom do you vote for?",
            votingPromptDetective: "{playerName}, who do you think is the Impostor?",
            castVoteButton: "Cast Vote", // Currently unused as button is hidden
            voteError: "An error occurred. Please try voting again.", // Generic error
            resultsTitle: "Results",
            impostorWasLabel: "The Impostor was:",
            votesReceivedLabel: "Votes Received:",
            winnerDetectives: "The Detectives Win! They found the Impostor.",
            winnerImpostor: "The Impostor Wins! They escaped detection.",
            playAgainButton: "Play Again",
            voteResultText: "{playerName}: {count} vote(s)"
        },
        fr: { // NOTE: THESE ARE PLACEHOLDERS - REPLACE WITH ACTUAL TRANSLATIONS
            gameTitle: "Le Jeu de l'Imposteur",
            languageLabel: "Langue :",
            playerNamesPrompt: "Entrez les noms des joueurs (un par ligne ou séparés par des virgules) :",
            playerNamesPlaceholder: "Alice\nBob\nCharlie",
            startGameButton: "Commencer le jeu",
            startErrorPlayerCount: "Il faut au moins 3 joueurs.",
            startErrorUniqueNames: "Les noms des joueurs doivent être uniques.",
            startErrorNoNames: "Veuillez entrer les noms des joueurs.",
            startErrorNoQuestions: "Aucune question chargée. Impossible de démarrer le jeu.",
            startErrorLoadingQuestions: "Erreur lors du chargement des questions. Veuillez vérifier le fichier questions et rafraîchir.",
            startErrorStillNoQuestions: "Toujours aucune question chargée. Vérifiez le fichier questions.",
            passDevicePrompt: "Passez l'appareil à {playerName}.",
            nextPlayerButtonQuestion: "Afficher ma question",
            nextPlayerButtonVote: "Commencer à voter",
            questionPrompt: "Question pour {playerName} :",
            answerPlaceholder: "Entrez votre réponse",
            submitAnswerButton: "Soumettre la réponse",
            answerError: "Veuillez entrer une réponse.",
            discussionTitle: "Temps de discussion !",
            officialQuestionLabel: "La question était :",
            answersGivenLabel: "Réponses données :",
            discussionInstructions: "Discutez des réponses et essayez d'identifier l'Imposteur.",
            proceedToVotingButton: "Passer au vote",
            votingPromptImpostor: "{playerName}, pour qui votez-vous ?",
            votingPromptDetective: "{playerName}, qui pensez-vous être l'Imposteur ?",
            castVoteButton: "Voter",
            voteError: "Une erreur s'est produite. Veuillez réessayer de voter.",
            resultsTitle: "Résultats",
            impostorWasLabel: "L'Imposteur était :",
            votesReceivedLabel: "Votes reçus :",
            winnerDetectives: "Les Détectives gagnent ! Ils ont trouvé l'Imposteur.",
            winnerImpostor: "L'Imposteur gagne ! Il a échappé à la détection.",
            playAgainButton: "Rejouer",
            voteResultText: "{playerName} : {count} vote(s)"
        },
        de: { // NOTE: THESE ARE PLACEHOLDERS - REPLACE WITH ACTUAL TRANSLATIONS
            gameTitle: "Das Hochstapler-Spiel",
            languageLabel: "Sprache:",
            playerNamesPrompt: "Spielernamen eingeben (einer pro Zeile oder durch Komma getrennt):",
            playerNamesPlaceholder: "Alice\nBob\nCharlie",
            startGameButton: "Spiel starten",
            startErrorPlayerCount: "Sie benötigen mindestens 3 Spieler.",
            startErrorUniqueNames: "Spielernamen müssen eindeutig sein.",
            startErrorNoNames: "Bitte Spielernamen eingeben.",
            startErrorNoQuestions: "Keine Fragen geladen. Spiel kann nicht gestartet werden.",
            startErrorLoadingQuestions: "Fehler beim Laden der Fragen. Bitte überprüfen Sie die Fragendatei und aktualisieren Sie.",
            startErrorStillNoQuestions: "Immer noch keine Fragen geladen. Überprüfen Sie die Fragendatei.",
            passDevicePrompt: "Gib das Gerät an {playerName} weiter.",
            nextPlayerButtonQuestion: "Meine Frage anzeigen",
            nextPlayerButtonVote: "Abstimmung starten",
            questionPrompt: "Frage für {playerName}:",
            answerPlaceholder: "Gib deine Antwort ein",
            submitAnswerButton: "Antwort absenden",
            answerError: "Bitte gib eine Antwort ein.",
            discussionTitle: "Diskussionszeit!",
            officialQuestionLabel: "Die Frage war:",
            answersGivenLabel: "Gegebene Antworten:",
            discussionInstructions: "Diskutiert die Antworten und versucht, den Hochstapler zu identifizieren.",
            proceedToVotingButton: "Zur Abstimmung übergehen",
            votingPromptImpostor: "{playerName}, für wen stimmst du?",
            votingPromptDetective: "{playerName}, wer ist deiner Meinung nach der Hochstapler?",
            castVoteButton: "Stimme abgeben",
            voteError: "Ein Fehler ist aufgetreten. Bitte versuchen Sie erneut abzustimmen.",
            resultsTitle: "Ergebnisse",
            impostorWasLabel: "Der Hochstapler war:",
            votesReceivedLabel: "Erhaltene Stimmen:",
            winnerDetectives: "Die Detektive gewinnen! Sie haben den Hochstapler gefunden.",
            winnerImpostor: "Der Hochstapler gewinnt! Er ist der Entdeckung entkommen.",
            playAgainButton: "Nochmal spielen",
            voteResultText: "{playerName}: {count} Stimme(n)"
        },
        sv: { // NOTE: THESE ARE PLACEHOLDERS - REPLACE WITH ACTUAL TRANSLATIONS
            gameTitle: "Impostor-Spelet",
            languageLabel: "Språk:",
            playerNamesPrompt: "Ange spelarnamn (ett per rad eller kommaseparerade):",
            playerNamesPlaceholder: "Alice\nBob\nCharlie",
            startGameButton: "Starta spel",
            startErrorPlayerCount: "Du behöver minst 3 spelare.",
            startErrorUniqueNames: "Spelarnamn måste vara unika.",
            startErrorNoNames: "Ange spelarnamn.",
            startErrorNoQuestions: "Inga frågor laddade. Kan inte starta spelet.",
            startErrorLoadingQuestions: "Fel vid laddning av frågor. Kontrollera frågefilen och uppdatera.",
            startErrorStillNoQuestions: "Fortfarande inga frågor laddade. Kontrollera frågefilen.",
            passDevicePrompt: "Skicka enheten till {playerName}.",
            nextPlayerButtonQuestion: "Visa min fråga",
            nextPlayerButtonVote: "Starta röstning",
            questionPrompt: "Fråga till {playerName}:",
            answerPlaceholder: "Ange ditt svar",
            submitAnswerButton: "Skicka svar",
            answerError: "Ange ett svar.",
            discussionTitle: "Diskussionstid!",
            officialQuestionLabel: "Frågan var:",
            answersGivenLabel: "Givna svar:",
            discussionInstructions: "Diskutera svaren och försök identifiera Impostorn.",
            proceedToVotingButton: "Gå till röstning",
            votingPromptImpostor: "{playerName}, vem röstar du på?",
            votingPromptDetective: "{playerName}, vem tror du är Impostorn?",
            castVoteButton: "Rösta",
            voteError: "Ett fel inträffade. Försök rösta igen.",
            resultsTitle: "Resultat",
            impostorWasLabel: "Impostorn var:",
            votesReceivedLabel: "Mottagna röster:",
            winnerDetectives: "Detektiverna vinner! De hittade Impostorn.",
            winnerImpostor: "Impostorn vinner! Hen undkom upptäckt.",
            playAgainButton: "Spela igen",
            voteResultText: "{playerName}: {count} röst(er)"
        }
    };


    // --- Functions ---

    // Utility function to get translation
    function t(key, lang = currentLanguage, replacements = {}) {
        let text = translations[lang]?.[key] || translations.en[key] || `Missing translation: ${key}`;
        for (const placeholder in replacements) {
            text = text.replace(`{${placeholder}}`, replacements[placeholder]);
        }
        return text;
    }

    // Update UI text based on selected language
    function updateUIForLanguage(lang) {
        currentLanguage = lang;
        document.querySelectorAll('[data-translate]').forEach(el => {
            const key = el.getAttribute('data-translate');
            el.textContent = t(key, lang);
        });
         document.querySelectorAll('[data-translate-placeholder]').forEach(el => {
            const key = el.getAttribute('data-translate-placeholder');
            el.placeholder = t(key, lang);
        });
        // Update dynamic text elements if needed (though most are updated contextually)
        // Example: Update start error message if it's currently displayed
        if (startError.textContent) {
             // Re-trigger the error display logic if possible, or map existing error message back to a key
             // This part might need refinement depending on how errors are handled.
             // For now, we'll just clear it on language change.
             startError.textContent = '';
        }
        // Reload questions for the new language
        loadQuestions();
    }

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
        const lang = currentLanguage; // Use the currently selected language
        const questionFile = `questions_${lang}.json`;
        console.log(`Attempting to load questions from: ${questionFile}`);
        try {
            // Add cache-busting query parameter to prevent stale files
            const response = await fetch(`${questionFile}?v=${Date.now()}`);
            if (!response.ok) {
                 // Try falling back to English if the language file is not found
                 if (lang !== 'en') {
                    console.warn(`Questions file not found for language '${lang}'. Falling back to English.`);
                    currentLanguage = 'en'; // Update state if falling back
                    languageSelect.value = 'en'; // Update dropdown
                    await loadQuestions(); // Recursively call with 'en'
                    return; // Stop further execution for the original language attempt
                 } else {
                    throw new Error(`HTTP error! status: ${response.status} for ${questionFile}`);
                 }
            }
            questions = await response.json();
            console.log("Questions loaded:", questions);
            if (!Array.isArray(questions) || questions.length === 0) {
                 console.error("Loaded questions data is not a valid non-empty array from:", questionFile);
                 startError.textContent = t('startErrorLoadingQuestions'); // Use translated error
                 questions = []; // Ensure it's an empty array if invalid
            }
        } catch (error) {
            console.error(`Failed to load questions from ${questionFile}:`, error);
            // Attempt fallback to English if not already English
            if (lang !== 'en') {
                 console.warn(`Error loading ${questionFile}. Falling back to English.`);
                 currentLanguage = 'en';
                 languageSelect.value = 'en';
                 await loadQuestions(); // Retry with English
            } else {
                 startError.textContent = t('startErrorLoadingQuestions'); // Use translated error
                 questions = []; // Ensure it's an empty array on error
            }
        }
    }


    function startGame() {
        startError.textContent = ''; // Clear previous errors
        const namesRaw = playerNamesInput.value.trim();
        if (!namesRaw) {
            startError.textContent = t('startErrorNoNames');
            return;
        }

        // Split by newline or comma, trim whitespace, filter empty names
        const potentialNames = namesRaw.split(/[\n,]/).map(name => name.trim()).filter(name => name);

        if (potentialNames.length < 3) {
            startError.textContent = t('startErrorPlayerCount');
            return;
        }

        // Check for duplicate names
        const uniqueNames = new Set(potentialNames);
        if (uniqueNames.size !== potentialNames.length) {
            startError.textContent = t('startErrorUniqueNames');
            return;
        }

        if (questions.length === 0) {
            startError.textContent = t('startErrorNoQuestions');
            // Attempt to load again in case it failed silently before
            loadQuestions().then(() => {
                if (questions.length > 0) {
                     startGame(); // Retry if load succeeds now
                } else {
                     // Ensure the error message reflects the final state after attempting reload
                     startError.textContent = t('startErrorStillNoQuestions');
                }
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
        const currentPlayerName = players[currentPlayerIndex]?.name || ''; // Handle potential undefined player

        if (gameState === 'asking') {
            if (currentPlayerIndex < players.length) {
                nextPlayerMessage.textContent = t('passDevicePrompt', currentLanguage, { playerName: currentPlayerName });
                nextPlayerButton.textContent = t('nextPlayerButtonQuestion');
                showScreen('nextPlayer');
            } else {
                // All answers collected, move to discussion
                gameState = 'discussing';
                showDiscussion();
            }
        } else if (gameState === 'voting') {
             if (currentPlayerIndex < players.length) {
                nextPlayerMessage.textContent = t('passDevicePrompt', currentLanguage, { playerName: currentPlayerName }); // Re-use prompt
                nextPlayerButton.textContent = t('nextPlayerButtonVote');
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
        // Update the dynamic part of the question prompt
        const questionPromptElement = document.querySelector('[data-translate-dynamic="questionPrompt"]');
        questionPromptElement.innerHTML = t('questionPrompt', currentLanguage, { playerName: '' }); // Set base text
        questionPlayerName.textContent = currentPlayer.name; // Insert name into span

        questionText.textContent = currentPlayer.isImpostor ? currentQuestionPair.impostor : currentQuestionPair.official;
        answerInput.value = ''; // Clear previous answer
        answerError.textContent = ''; // Clear previous error
        showScreen('question');
        answerInput.focus(); // Focus the input field
    }

    function submitAnswer() {
        const answer = answerInput.value.trim();
        if (!answer) {
            answerError.textContent = t('answerError');
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

        // Create a shuffled copy of players to randomize answer display order
        const shuffledPlayers = [...players];
        shuffleArray(shuffledPlayers); // Use the existing shuffle function

        // Display each player's name and answer in shuffled order
        shuffledPlayers.forEach(player => {
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
        // votingPlayerName.textContent = currentPlayer.name; // Span is no longer used directly here
        voteError.textContent = ''; // Clear previous error

        // Set the voting prompt using translations and dynamic replacement
        const promptKey = currentPlayer.isImpostor ? 'votingPromptImpostor' : 'votingPromptDetective';
        votingPrompt.textContent = t(promptKey, currentLanguage, { playerName: currentPlayer.name });


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
        const currentPlayerName = players[currentPlayerIndex]?.name; // Safety check
        if (!currentPlayerName || !currentVotes[currentPlayerName]) {
            // This case shouldn't happen with the current button logic, but good for safety
            voteError.textContent = t('voteError');
            console.error("SubmitVote called but no vote recorded for:", currentPlayerName);
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
            // Use translation for vote count text
            li.textContent = t('voteResultText', currentLanguage, { playerName: player.name, count: player.votesReceived });
            resultsVotesList.appendChild(li);
            if (player.votesReceived > maxVotes) {
                maxVotes = player.votesReceived;
            }
        });

        // Count how many players received the maximum number of votes
        let playersWithMaxVotes = 0;
        if (maxVotes > 0) {
            sortedPlayers.forEach(player => {
                if (player.votesReceived === maxVotes) {
                    playersWithMaxVotes++;
                }
            });
        }

        // Determine winner using translated messages
        // Detectives win ONLY if the impostor received the unique maximum number of votes (and votes were cast)
        if (maxVotes > 0 && impostor.votesReceived === maxVotes && playersWithMaxVotes === 1) {
            winnerMessage.textContent = t('winnerDetectives');
        } else {
            // Impostor wins if they didn't get the most votes, or if they tied for the most votes, or if no votes were cast.
            winnerMessage.textContent = t('winnerImpostor');
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
        // Pre-fill player names for the next game
        if (players && players.length > 0) {
            playerNamesInput.value = players.map(p => p.name).join('\n');
        } else {
            playerNamesInput.value = ''; // Clear if no players somehow
        }
        startError.textContent = '';
        answerError.textContent = '';
        voteError.textContent = '';
        // Don't reload questions on reset, but ensure UI matches selected language
        updateUIForLanguage(currentLanguage); // Re-apply translations to reset screen text
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
    languageSelect.addEventListener('change', (e) => {
        updateUIForLanguage(e.target.value);
    });


    // --- Initial Load ---
    // Set initial language based on dropdown default and load corresponding UI/questions
    updateUIForLanguage(languageSelect.value);
    showScreen('start'); // Show the start screen initially

});
