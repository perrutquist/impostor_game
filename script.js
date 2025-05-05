document.addEventListener('DOMContentLoaded', () => {
    'use strict';
    // --- DOM Elements ---
    const screenElements = {
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

    // Rules Modal Elements
    const showRulesButton = document.getElementById('show-rules-button');
    const rulesModal = document.getElementById('rules-modal');
    const rulesTextContent = document.getElementById('rules-text-content');
    const closeRulesButton = document.getElementById('close-rules-button');


    // --- Game State ---
    let players = []; // { name: string, answer: string, votesReceived: number, isImpostor: boolean }
    let questions = []; // Array of arrays of strings: [ ["q1a", "q1b"], ["q2a", "q2b", "q2c"], ... ]
    let currentQuestionPair = null; // { official: string, impostor: string } - selected and assigned for the round
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
            voteResultText: "{playerName}: {count} vote(s)",
            // Rules specific translations
            showRulesButton: "Show Rules",
            rulesTitle: "Game Rules",
            closeRulesButton: "Close",
            rulesContent: `
                <p><strong>Objective:</strong></p>
                <ul>
                    <li><strong>Detectives:</strong> Identify the Impostor.</li>
                    <li><strong>Impostor:</strong> Avoid being identified.</li>
                </ul>
                <p><strong>Setup:</strong></p>
                <ul>
                    <li>Enter the names of all players (minimum 3).</li>
                    <li>The game randomly assigns one player as the Impostor.</li>
                    <li>A pair of related questions is chosen: one for the Detectives (Official Question) and one slightly different for the Impostor (Impostor Question).</li>
                </ul>
                <p><strong>Gameplay:</strong></p>
                <ol>
                    <li><strong>Questions:</strong> Each player is secretly shown their question (Detectives see the Official Question, the Impostor sees the Impostor Question).</li>
                    <li><strong>Answers:</strong> Each player provides a short answer based on their question.</li>
                    <li><strong>Discussion:</strong> All answers are revealed (without revealing who gave which answer initially, though the discussion screen currently shows names). Players discuss the answers, trying to figure out who might have received a different question (the Impostor). The official question is revealed.</li>
                    <li><strong>Voting:</strong> Each player votes for who they think the Impostor is. Players cannot vote for themselves.</li>
                    <li><strong>Reveal:</strong> Votes are tallied. The player with the most votes is accused. The true Impostor is revealed.</li>
                </ol>
                <p><strong>Winning:</strong></p>
                <ul>
                    <li>The <strong>Detectives win</strong> if the Impostor receives the most votes (and it's not a tie for the most votes).</li>
                    <li>The <strong>Impostor wins</strong> if they do not receive the most votes, or if they tie for the most votes.</li>
                </ul>
            `
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
            voteResultText: "{playerName} : {count} vote(s)",
            // Rules specific translations (PLACEHOLDERS)
            showRulesButton: "Afficher les règles",
            rulesTitle: "Règles du jeu",
            closeRulesButton: "Fermer",
            rulesContent: `
                <p><strong>Objectif :</strong></p>
                <ul>
                    <li><strong>Détectives :</strong> Identifier l'Imposteur.</li>
                    <li><strong>Imposteur :</strong> Éviter d'être identifié.</li>
                </ul>
                <p><strong>Mise en place :</strong></p>
                <ul>
                    <li>Entrez les noms de tous les joueurs (minimum 3).</li>
                    <li>Le jeu désigne aléatoirement un joueur comme Imposteur.</li>
                    <li>Une paire de questions liées est choisie : une pour les Détectives (Question Officielle) et une légèrement différente pour l'Imposteur (Question Imposteur).</li>
                </ul>
                <p><strong>Déroulement du jeu :</strong></p>
                <ol>
                    <li><strong>Questions :</strong> Chaque joueur voit secrètement sa question (les Détectives voient la Question Officielle, l'Imposteur voit la Question Imposteur).</li>
                    <li><strong>Réponses :</strong> Chaque joueur donne une réponse courte basée sur sa question.</li>
                    <li><strong>Discussion :</strong> Toutes les réponses sont révélées. Les joueurs discutent des réponses, essayant de deviner qui aurait pu recevoir une question différente (l'Imposteur). La question officielle est révélée.</li>
                    <li><strong>Vote :</strong> Chaque joueur vote pour celui qu'il pense être l'Imposteur. Les joueurs ne peuvent pas voter pour eux-mêmes.</li>
                    <li><strong>Révélation :</strong> Les votes sont comptés. Le joueur avec le plus de votes est accusé. Le véritable Imposteur est révélé.</li>
                </ol>
                <p><strong>Gagner :</strong></p>
                <ul>
                    <li>Les <strong>Détectives gagnent</strong> si l'Imposteur reçoit le plus de votes (et qu'il n'y a pas d'égalité pour le plus grand nombre de votes).</li>
                    <li>L'<strong>Imposteur gagne</strong> s'il ne reçoit pas le plus de votes, ou s'il est à égalité pour le plus grand nombre de votes.</li>
                </ul>
            `
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
            voteResultText: "{playerName}: {count} Stimme(n)",
            // Rules specific translations (PLACEHOLDERS)
            showRulesButton: "Regeln anzeigen",
            rulesTitle: "Spielregeln",
            closeRulesButton: "Schließen",
            rulesContent: `
                <p><strong>Ziel:</strong></p>
                <ul>
                    <li><strong>Detektive:</strong> Identifiziert den Hochstapler.</li>
                    <li><strong>Hochstapler:</strong> Vermeide es, identifiziert zu werden.</li>
                </ul>
                <p><strong>Setup:</strong></p>
                <ul>
                    <li>Gebt die Namen aller Spieler ein (mindestens 3).</li>
                    <li>Das Spiel wählt zufällig einen Spieler als Hochstapler aus.</li>
                    <li>Ein Paar verwandter Fragen wird ausgewählt: eine für die Detektive (Offizielle Frage) und eine leicht abweichende für den Hochstapler (Hochstapler-Frage).</li>
                </ul>
                <p><strong>Spielablauf:</strong></p>
                <ol>
                    <li><strong>Fragen:</strong> Jedem Spieler wird heimlich seine Frage gezeigt (Detektive sehen die Offizielle Frage, der Hochstapler sieht die Hochstapler-Frage).</li>
                    <li><strong>Antworten:</strong> Jeder Spieler gibt eine kurze Antwort basierend auf seiner Frage.</li>
                    <li><strong>Diskussion:</strong> Alle Antworten werden aufgedeckt. Die Spieler diskutieren die Antworten und versuchen herauszufinden, wer eine andere Frage erhalten haben könnte (der Hochstapler). Die offizielle Frage wird enthüllt.</li>
                    <li><strong>Abstimmung:</strong> Jeder Spieler stimmt darüber ab, wer seiner Meinung nach der Hochstapler ist. Spieler können nicht für sich selbst stimmen.</li>
                    <li><strong>Enthüllung:</strong> Die Stimmen werden ausgezählt. Der Spieler mit den meisten Stimmen wird beschuldigt. Der wahre Hochstapler wird enthüllt.</li>
                </ol>
                <p><strong>Gewinnen:</strong></p>
                <ul>
                    <li>Die <strong>Detektive gewinnen</strong>, wenn der Hochstapler die meisten Stimmen erhält (und es kein Unentschieden bei den meisten Stimmen gibt).</li>
                    <li>Der <strong>Hochstapler gewinnt</strong>, wenn er nicht die meisten Stimmen erhält oder wenn er die meisten Stimmen teilt.</li>
                </ul>
            `
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
            voteResultText: "{playerName}: {count} röst(er)",
            // Rules specific translations (PLACEHOLDERS)
            showRulesButton: "Visa regler",
            rulesTitle: "Spelregler",
            closeRulesButton: "Stäng",
            rulesContent: `
                <p><strong>Mål:</strong></p>
                <ul>
                    <li><strong>Detektiver:</strong> Identifiera Impostorn.</li>
                    <li><strong>Impostor:</strong> Undvik att bli identifierad.</li>
                </ul>
                <p><strong>Inställningar:</strong></p>
                <ul>
                    <li>Ange namnen på alla spelare (minst 3).</li>
                    <li>Spelet utser slumpmässigt en spelare till Impostor.</li>
                    <li>Ett par relaterade frågor väljs: en för Detektiverna (Officiell Fråga) och en något annorlunda för Impostorn (Impostor-Fråga).</li>
                </ul>
                <p><strong>Spelförlopp:</strong></p>
                <ol>
                    <li><strong>Frågor:</strong> Varje spelare får i hemlighet se sin fråga (Detektiver ser den Officiella Frågan, Impostorn ser Impostor-Frågan).</li>
                    <li><strong>Svar:</strong> Varje spelare ger ett kort svar baserat på sin fråga.</li>
                    <li><strong>Diskussion:</strong> Alla svar avslöjas. Spelarna diskuterar svaren och försöker lista ut vem som kan ha fått en annan fråga (Impostorn). Den officiella frågan avslöjas.</li>
                    <li><strong>Röstning:</strong> Varje spelare röstar på vem de tror är Impostorn. Spelare kan inte rösta på sig själva.</li>
                    <li><strong>Avslöjande:</strong> Rösterna räknas. Spelaren med flest röster anklagas. Den sanna Impostorn avslöjas.</li>
                </ol>
                <p><strong>Att vinna:</strong></p>
                <ul>
                    <li><strong>Detektiverna vinner</strong> om Impostorn får flest röster (och det inte är oavgjort om flest röster).</li>
                    <li><strong>Impostorn vinner</strong> om hen inte får flest röster, eller om hen delar på flest röster.</li>
                </ul>
            `
        }
    };


    // --- Functions ---

    // Utility function to get translation using the currentLanguage state
    function t(key, replacements = {}) {
        let text = translations[currentLanguage]?.[key] || translations.en[key] || `Missing translation: ${key}`;
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
            // Update textContent for most elements, but handle specific cases if needed
            if (key) { // Ensure key exists
                el.textContent = t(key); // Pass lang implicitly via currentLanguage state
            }
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
        Object.values(screenElements).forEach(screen => screen.classList.remove('active'));
        screenElements[screenId].classList.add('active');
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
            const rawQuestions = await response.json();
            console.log("Raw questions data loaded:", rawQuestions);

            // Validate the new structure: array of arrays, each inner array having at least 2 strings
            if (!Array.isArray(rawQuestions) || rawQuestions.length === 0 || !rawQuestions.every(qSet => Array.isArray(qSet) && qSet.length >= 2 && qSet.every(q => typeof q === 'string'))) {
                 console.error("Loaded questions data is not a valid array of arrays with at least two strings each from:", questionFile);
                 startError.textContent = t('startErrorLoadingQuestions'); // Use translated error
                 questions = []; // Ensure it's an empty array if invalid
            } else {
                questions = rawQuestions; // Assign validated questions
                console.log("Validated questions stored:", questions);
            }
        } catch (error) {
            console.error(`Failed to load or parse questions from ${questionFile}:`, error);
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

        // Select a random set of questions (which is now an array of strings)
        const selectedQuestionSet = questions[Math.floor(Math.random() * questions.length)];

        // Shuffle the selected set to randomize which becomes official/impostor
        const shuffledSet = [...selectedQuestionSet]; // Create a copy before shuffling
        shuffleArray(shuffledSet);

        // Assign the first two shuffled questions to the official/impostor roles for this round
        // Assumes validation in loadQuestions ensured each set has at least 2 questions
        currentQuestionPair = {
            official: shuffledSet[0],
            impostor: shuffledSet[1]
        };

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
                nextPlayerMessage.textContent = t('passDevicePrompt', { playerName: currentPlayerName });
                nextPlayerButton.textContent = t('nextPlayerButtonQuestion');
                showScreen('nextPlayer');
            } else {
                // All answers collected, move to discussion
                gameState = 'discussing';
                showDiscussion();
            }
        } else if (gameState === 'voting') {
             if (currentPlayerIndex < players.length) {
                nextPlayerMessage.textContent = t('passDevicePrompt', { playerName: currentPlayerName }); // Re-use prompt
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
        questionPromptElement.innerHTML = t('questionPrompt', { playerName: '' }); // Set base text
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
        votingPrompt.textContent = t(promptKey, { playerName: currentPlayer.name });


        votingOptionsDiv.innerHTML = ''; // Clear previous options
        players.forEach((player, index) => {
            // Players cannot vote for themselves
            if (index !== currentPlayerIndex) {
                const button = document.createElement('button');
                // Include the player's answer in the button text
                button.textContent = `${player.name}: "${player.answer}"`;
                button.dataset.voteIndex = index; // Store the index of the player being voted for
                button.addEventListener('click', (e) => {
                     // Immediately record vote when button is clicked
                     const votedForIndex = parseInt(e.target.dataset.voteIndex);
                     const votedForName = players[votedForIndex].name;
                     currentVotes[currentPlayer.name] = votedForName;
                     console.log(`${currentPlayer.name} voted for ${votedForName}`);
                     // Vote is recorded above, now advance the turn immediately.
                     submitVote();
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
            // This case shouldn't happen with the current button logic (vote recorded before calling submitVote),
            // but it's a safety check.
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
            li.textContent = t('voteResultText', { playerName: player.name, count: player.votesReceived });
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
        // Store names from the completed game *before* clearing the players array
        const lastPlayerNames = players.map(p => p.name).join('\n');

        // Reset game state variables
        players = [];
        currentQuestionPair = null;
        impostorIndex = -1;
        currentPlayerIndex = 0;
        gameState = 'setup';
        currentVotes = {};

        // Pre-fill player names for the next game using stored names
        playerNamesInput.value = lastPlayerNames;

        // Clear errors and dynamic content
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
