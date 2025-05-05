# Code layout

## Files

*   `index.html`: Main HTML file containing the structure for all game screens.
*   `style.css`: CSS for styling the elements and managing screen visibility.
*   `script.js`: JavaScript file containing the game logic.
*   `questions_xx.json`: JSON files storing pairs of questions (official question and impostor question) for different languages (e.g., `questions_en.json`, `questions_fr.json`).

## App Screens (Managed via showing/hiding divs)

1.  **Start Screen (`id="start-screen"`)**
    *   Title: "The Impostor Game"
    *   Input area for player names (e.g., comma-separated or one per line).
    *   Button: "Start Game"

2.  **Next Player Screen (`id="next-player-screen"`)**
    *   Message: "Pass the device to [Player Name]."
    *   Button: "Show My Question" (or "Start Voting" if transitioning to voting)

3.  **Question Screen (`id="question-screen"`)**
    *   Displays: "Question for [Player Name]:"
    *   Displays the specific question for the current player.
    *   Input field for the answer.
    *   Button: "Submit Answer"

4.  **Discussion Screen (`id="discussion-screen"`)**
    *   Displays: "The Official Question Was:" followed by the question text.
    *   Displays: "Answers Given:" followed by a list of all submitted answers (order randomized or fixed).
    *   Instruction: "Discuss the answers and try to identify the Impostor."
    *   Button: "Proceed to Voting"

5.  **Voting Screen (`id="voting-screen"`)**
    *   Displays: "[Player Name], who do you think is the Impostor?"
    *   Displays buttons/radio inputs for each player's name.
    *   Button: "Cast Vote"

6.  **Final Screen (`id="final-screen"`)**
    *   Displays: "Results"
    *   Displays: "The Impostor was: [Impostor Name]"
    *   Displays: Vote counts for each player (e.g., "[Player Name] received X votes").
    *   Displays: Winner message (e.g., "The Detectives Win!" or "The Impostor Wins!").
    *   Button: "Play Again" (resets to Start Screen)

## Game State (JavaScript Variables within `script.js` IIFE scope)

*   `players`: Array of player objects, e.g., `[{ name: "Alice", answer: "", votesReceived: 0, isImpostor: false }, ...]`.
*   `questions`: Array loaded from the current language's JSON file (e.g., `questions_en.json`).
*   `currentQuestionPair`: The selected pair for the round `{ official: "...", impostor: "..." }`.
*   `impostorIndex`: Index of the player in the `players` array who is the impostor.
*   `currentPlayerIndex`: Index of the player whose turn it is (used for both asking questions and casting votes).
*   `gameState`: String indicating the current phase ('setup', 'asking', 'discussing', 'voting', 'results').
*   `currentVotes`: Object storing votes for the current round, e.g., `{ "Alice": "Bob", "Charlie": "Bob" }` (key is voter, value is voted player).
*   `currentLanguage`: String indicating the selected language code (e.g., 'en', 'fr').
*   `translations`: Large object containing UI text strings for all supported languages.

## Key JavaScript Functions (within `script.js`)

*   `t(key, replacements = {})`: Returns the translated string for the given `key` in the `currentLanguage`, performing optional placeholder replacements.
*   `updateUIForLanguage(lang)`: Updates all static UI text elements based on the selected language and reloads questions.
*   `showScreen(screenId)`: Hides all screen divs and shows the one with the specified ID.
*   `shuffleArray(array)`: Shuffles an array in place using Fisher-Yates algorithm.
*   `loadQuestions()`: Asynchronously fetches and parses questions from the JSON file corresponding to `currentLanguage`, with fallback to English.
*   `startGame()`: Validates player names, initializes `players` array, shuffles players, selects question pair, assigns impostor, and transitions to the first 'asking' phase 'Next Player' screen.
*   `promptNextPlayer()`: Shows the 'Next Player' screen, adapting the message and button text based on whether the game is in the 'asking' or 'voting' phase. Transitions to 'Discussion' or 'Results' if all players have had their turn.
*   `handleNextPlayerButton()`: Event handler for the button on the 'Next Player' screen; calls either `showQuestion()` or `showVotingOptions()` based on `gameState`.
*   `showQuestion()`: Displays the 'Question' screen with the appropriate question (official or impostor) for the `currentPlayerIndex`.
*   `submitAnswer()`: Validates and stores the current player's answer, increments `currentPlayerIndex`, and calls `promptNextPlayer()`.
*   `showDiscussion()`: Displays the 'Discussion' screen, showing the official question and all submitted answers.
*   `startVoting()`: Sets `gameState` to 'voting', resets `currentPlayerIndex` and `currentVotes`, and calls `promptNextPlayer()` to begin the voting sequence.
*   `showVotingOptions()`: Displays the 'Voting' screen for the `currentPlayerIndex`, showing buttons for other players. Attaches click listeners to these buttons that record the vote and immediately call `submitVote()`.
*   `submitVote()`: Increments `currentPlayerIndex` and calls `promptNextPlayer()` to advance to the next voter or to the results phase. (Vote recording now happens in `showVotingOptions`).
*   `calculateResults()`: Tallies the votes stored in `currentVotes` and updates the `votesReceived` count for each player.
*   `showResults()`: Displays the 'Final' screen, revealing the impostor, showing vote counts, determining the winner based on votes against the impostor, and displaying the appropriate win message.
*   `resetGame()`: Resets all game state variables, clears dynamic UI elements, pre-fills player names from the previous round, and returns to the 'Start' screen.

## Other remarks

*   **Player Privacy:** The "Pass the device" screen helps maintain privacy during question/voting turns.
*   **Code Structure:** For significantly larger features, refactoring into modules (e.g., UIManager, GameState) could improve maintainability.
*   **Translations:** Storing translations in separate files (e.g., `translations_en.json`) instead of a large inline object could make management easier but requires changes to how they are loaded.
*   **Error Handling:** Error messages could be made more specific in some cases (e.g., voting errors).
*   **State Management:** For more complex state interactions, a more formal state management pattern could be adopted.
*   **Styling:** Assumes `style.css` handles screen visibility and general appearance.
