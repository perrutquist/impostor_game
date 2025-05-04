# Code layout

## Files

*   `index.html`: Main HTML file containing the structure for all game screens.
*   `style.css`: CSS for styling the elements and managing screen visibility.
*   `script.js`: JavaScript file containing the game logic.
*   `questions.json`: JSON file storing pairs of questions (official question and impostor question).

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

## Game State (JavaScript Variables)

*   `players`: Array of player objects, e.g., `[{ name: "Alice", answer: "", votesReceived: 0 }, ...]`.
*   `questions`: Array loaded from `questions.json`.
*   `currentQuestionPair`: The selected pair for the round `{ official: "...", impostor: "..." }`.
*   `impostorIndex`: Index of the player who is the impostor.
*   `currentPlayerIndex`: Index of the player whose turn it is (for questions/voting).
*   `gameState`: String indicating the current phase (e.g., 'setup', 'asking', 'discussing', 'voting', 'results').
*   `answers`: Array to temporarily store answers during the question round.
*   `votes`: Array or object to store who voted for whom.

## Key JavaScript Functions

*   `init()`: Initializes the game, sets up event listeners.
*   `loadQuestions()`: Fetches questions from `questions.json`.
*   `showScreen(screenId)`: Hides all screens and shows the one with the specified ID.
*   `startGame()`: Reads player names, selects questions, assigns impostor, transitions to the first 'Next Player' screen.
*   `promptNextPlayer()`: Shows the 'Next Player' screen for the current player.
*   `showQuestion()`: Shows the 'Question' screen with the correct question for the current player.
*   `submitAnswer()`: Stores the answer, increments `currentPlayerIndex`, transitions to 'Next Player' or 'Discussion'.
*   `showDiscussion()`: Shows the 'Discussion' screen with the official question and all answers.
*   `startVoting()`: Resets `currentPlayerIndex`, transitions to the first 'Next Player' screen for voting.
*   `showVotingOptions()`: Shows the 'Voting' screen for the current player.
*   `submitVote()`: Records the vote, increments `currentPlayerIndex`, transitions to 'Next Player' (for voting) or 'Results'.
*   `calculateResults()`: Counts votes, determines the winner.
*   `showResults()`: Displays the 'Final' screen with results and winner.
*   `resetGame()`: Resets game state and returns to the 'Start' screen.

## Other remarks

*   Need robust handling for player names input (splitting, trimming).
*   Consider randomizing the order of answers displayed during discussion.
*   Ensure player privacy during question and voting rounds.
