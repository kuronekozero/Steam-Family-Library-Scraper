

(async function() {
    // Function to auto-scroll and scrape games incrementally
    async function autoScrollAndScrape(previousGames) {
        window.scrollBy(0, 1000);  // Scroll down by a small amount

        // Wait for the page to load new games
        await new Promise(r => setTimeout(r, 2000));  // Wait for 2 seconds for new content

        // Select all game containers
        const gameContainers = document.querySelectorAll('div[data-key="hover div"]');
        let newGames = [];

        gameContainers.forEach((container) => {
            const imgTag = container.querySelector('img');
            if (imgTag && imgTag.alt && !previousGames.includes(imgTag.alt)) {
                newGames.push(imgTag.alt);  // Add only new games to the list
            }
        });

        return newGames;
    }

    // Simulate clicking all "Show All" buttons (if any)
    const showAllButtons = document.querySelectorAll('button[data-action="ShowAll"]');
    for (const button of showAllButtons) {
        button.click();
        await new Promise(r => setTimeout(r, 1000));  // Wait a bit for content to load
    }

    console.log("All Show All buttons processed. Proceeding to scrape...");

    let gamesList = [];
    let previousGameCount = 0;
    let retryCount = 0;
    const maxRetries = 5; // Max retries to break out if no new games are found

    // Continuously scroll and scrape until no more games are found
    while (retryCount < maxRetries) {
        // Scrape games after scrolling
        const newGames = await autoScrollAndScrape(gamesList);

        // If new games were found, add them to the main list
        if (newGames.length > 0) {
            gamesList = gamesList.concat(newGames);
            console.log(`New games found: ${newGames.length}, Total games so far: ${gamesList.length}`);
            retryCount = 0;  // Reset retries since we found new games
        } else {
            retryCount++;
            console.log(`No new games found. Retry attempt: ${retryCount}/${maxRetries}`);
        }
    }

    console.log("Finished scraping games. Total games found: ", gamesList.length);

    // Download the games list to a file
    const blob = new Blob([gamesList.join("\n")], { type: 'text/plain' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = 'steam_games.txt';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
})();
