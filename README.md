# The Impostor Game

Find the player who got a different question!

This is a simple web application to moderate a game of "The Impostor".

## Rules of the game

1.  **Secret Questions:** The app secretly gives each player a question. All players except one (the "Impostor") receive the *same* question (the "Official Question"). The Impostor receives a *different* but related question.
2.  **Answers:** Each player provides an answer to their secret question.
3.  **Reveal & Discuss:** The app reveals the *Official Question* (not the Impostor's question) and *all* the answers given by the players, showing who gave which answer. Players discuss the answers, trying to figure out who might have answered a different question.
4.  **Vote:** Players secretly vote for who they think the Impostor is.
5.  **Reveal & Win:** The app reveals who the Impostor was and the vote counts.
    *   If the Impostor receives the most votes (or is tied for the most votes), the other players (the "Detectives") win!
    *   If any other player receives more votes than the Impostor, the Impostor wins!

## How to play using this app

1.  **Setup:** Open the `index.html` file in your browser. Enter the names of all players (at least 3 recommended) and click "Start Game".
2.  **Question Round:** The app will prompt each player one by one.
    *   It will ask the current player to confirm they are ready (so others don't see their question).
    *   It will display their secret question.
    *   The player types their answer and submits it.
    *   The app prompts for the next player.
3.  **Discussion:** Once all answers are collected, the app shows the *Official Question* and all the answers given, along with the player names. Players discuss.
4.  **Voting Round:** The app asks each player one by one to vote for who they think the Impostor is.
5.  **Results:** The app displays the results: who the Impostor was, how many votes each player received, and who won the game.
