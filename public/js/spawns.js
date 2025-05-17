document.addEventListener("DOMContentLoaded", () => {
    const chartContainer = document.getElementById("chartContainer");
    const listContainer = document.getElementById("listContainer");
    const selectHistory = document.getElementById("historySelect");

    let chart;

    // Fetch data from the server
    async function fetchData(endpoint) {
        try {
            const response = await fetch(endpoint);
            if (!response.ok) {
                throw new Error(`Error fetching data: ${response.statusText}`);
            }
            return await response.json();
        } catch (error) {
            console.error(error);
            return [];
        }
    }

    // Process data into spawns, catches, and catch rates
    function processData(data) {
        const players = {};
        const pokemons = {};

        data.forEach((entry) => {
            const { Player_Name, Pokemon_Name, Spawn_Type } = entry;

            // Count spawns and catches for players
            if (!players[Player_Name]) {
                players[Player_Name] = { spawns: 0, catches: 0 };
            }
            if (Spawn_Type.includes("ALERT")) {
                players[Player_Name].spawns++;
            } else if (Spawn_Type.includes("CAPTURED")) {
                players[Player_Name].catches++;
            }

            // Count spawns and catches for Pokémon
            if (!pokemons[Pokemon_Name]) {
                pokemons[Pokemon_Name] = { spawns: 0, catches: 0 };
            }
            if (Spawn_Type.includes("ALERT")) {
                pokemons[Pokemon_Name].spawns++;
            } else if (Spawn_Type.includes("CAPTURED")) {
                pokemons[Pokemon_Name].catches++;
            }
        });

        // Ensure no Pokémon has more catches than spawns
        Object.keys(pokemons).forEach((pokemon) => {
            const stats = pokemons[pokemon];
            if (stats.catches > stats.spawns) {
                stats.spawns = stats.catches;
            }
            stats.catchRate = stats.spawns > 0
                ? ((stats.catches / stats.spawns) * 100).toFixed(2) // Catch rate as a percentage
                : "0.00"; // No spawns, so catch rate is 0
        });

        return { players, pokemons };
    }

    // Update the chart and list
    async function updateData(endpoint) {
        let data = await fetchData(endpoint);
        if (!data.length) return;
        // Convert all Unix timestamps to JS Date objects (local time)
        data = data.map(entry => ({
            ...entry,
            parsedTimestamp: new Date(Number(entry.Timestamp) * 1000)
        }));

        const { players, pokemons } = processData(data);

        // Calculate total spawns for players and Pokémon
        const totalPlayerSpawns = Object.values(players).reduce((sum, player) => sum + player.spawns, 0);
        const totalCatches = Object.values(players).reduce((sum, player) => sum + player.catches, 0);
        const totalPokemonSpawns = Object.values(pokemons).reduce((sum, pokemon) => sum + pokemon.spawns, 0);

        // Prepare data for the chart
        const playerNames = Object.keys(players);
        const spawnCounts = playerNames.map((name) => players[name].spawns);
        const catchCounts = playerNames.map((name) => players[name].catches);

        // Update the pie chart
        if (chart) chart.destroy();
        chart = new Chart(chartContainer, {
            type: "pie",
            data: {
                labels: playerNames.map(
                    (name) =>
                        `${name} (${((players[name].spawns / totalPlayerSpawns) * 100).toFixed(2)}%)`
                ),
                datasets: [
                    {
                        label: "Spawns",
                        data: spawnCounts,
                        backgroundColor: playerNames.map(() => getRandomColor()),
                    },
                    {
                        label: "Catches",
                        data: catchCounts,
                        backgroundColor: playerNames.map(() => getRandomColor()),
                    },
                ],
            },
            options: {
                plugins: {
                    tooltip: {
                        callbacks: {
                            label: function (context) {
                                const datasetLabel = context.dataset.label;
                                const dataIndex = context.dataIndex;
                                const playerName = playerNames[dataIndex];
                                const value = context.raw;

                                if (datasetLabel === "Spawns") {
                                    const percentage = ((value / totalPlayerSpawns) * 100).toFixed(2);
                                    return `${playerName} (Spawns): ${value} (${percentage}%)`;
                                } else if (datasetLabel === "Catches") {
                                    const percentage = ((value / totalCatches) * 100).toFixed(2);
                                    return `${playerName} (Catches): ${value} (${percentage}%)`;
                                }
                            },
                        },
                    },
                },
            },
        });

        // Generate the sorted list of Pokémon
        const sortedPokemons = Object.entries(pokemons).sort(
            (a, b) => b[1].spawns - a[1].spawns
        );
        listContainer.innerHTML = `
            <h2>Pokémon List</h2>
            <ul>
                ${sortedPokemons
                        .map(
                            ([pokemon, stats]) =>
                                `<li data-pokemon="${pokemon}">${pokemon} (${((stats.spawns / totalPokemonSpawns) * 100).toFixed(2)}%): Spawns - ${stats.spawns}, Catches - ${stats.catches}, Catch Rate - ${stats.catchRate}%</li>`
                        )
                        .join("")}
            </ul>
        `;

        // Add click event listener to display players who spawned a specific Pokémon
        listContainer.addEventListener("click", (event) => {
            const clickedElement = event.target;
            const pokemonName = clickedElement.dataset.pokemon;

            if (pokemonName) {
                // Filter and sort spawns for the clicked Pokémon
                const pokemonSpawns = data
                    .filter((entry) => entry.Pokemon_Name === pokemonName)
                    .map((entry) => ({
                        ...entry,
                        parsedTimestamp: new Date(Date.parse(entry.parsedTimestamp)),
                    }))
                    .sort((a, b) => b.parsedTimestamp - a.parsedTimestamp) // Sort by latest timestamp
                    .map(
                        (entry) =>
                            `<li>${entry.Player_Name} (${entry.Spawn_Type}) at ${entry.parsedTimestamp.toLocaleString()}</li>`
                    )
                    .join("");

                // Update the spawn list container with the Pokémon's spawns
                const spawnListContainer = document.getElementById("spawnListContainer");
                spawnListContainer.innerHTML = `
                    <h2>${pokemonName}'s Spawns</h2>
                    <ul>
                        ${pokemonSpawns}
                    </ul>
                `;
            }
        });

        // Generate the list of players and their stats
        const playerStats = Object.entries(players)
            .sort((a, b) => b[1].spawns - a[1].spawns)
            .map(
                ([player, stats]) =>
                    `<li data-player="${player}">${player} (${((stats.spawns / totalPlayerSpawns) * 100).toFixed(2)}%): Spawns - ${stats.spawns}, Catches - ${stats.catches}</li>`
            )
            .join("");

        // Update the player stats container
        const playerStatsContainer = document.getElementById("playerStatsContainer");
        playerStatsContainer.innerHTML = `
        <h2>Player Stats</h2>
        <ul>
            ${playerStats}
        </ul>
    `;

        // Add click event listener to display spawns for a specific player
        playerStatsContainer.addEventListener("click", (event) => {
            const clickedElement = event.target;
            const playerName = clickedElement.dataset.player;

            if (playerName) {
                // Filter and sort spawns for the clicked player
                const playerSpawns = data
                    .filter((entry) => entry.Player_Name === playerName)
                    .map((entry) => ({
                        ...entry,
                        parsedTimestamp: new Date(Date.parse(entry.parsedTimestamp)),
                    }))
                    .sort((a, b) => b.parsedTimestamp - a.parsedTimestamp) // Sort by latest timestamp
                    .map(
                        (entry) =>
                            `<li>${entry.Pokemon_Name} (${entry.Spawn_Type}) at ${entry.parsedTimestamp.toLocaleString()}</li>`
                    )
                    .join("");

                // Update the spawn list container with the player's spawns
                const spawnListContainer = document.getElementById("spawnListContainer");
                spawnListContainer.innerHTML = `
                <h2>${playerName}'s Spawns</h2>
                <ul>
                    ${playerSpawns}
                </ul>
            `;
            }
        });

        // Generate the list of spawns sorted by the latest timestamp
        const sortedSpawns = data
            .map((entry) => {
                // Convert the human-readable timestamp to a valid Date object
                const parsedTimestamp = new Date(Date.parse(entry.parsedTimestamp));
                return {
                    ...entry,
                    parsedTimestamp,
                };
            })
            .sort((a, b) => b.parsedTimestamp - a.parsedTimestamp) // Sort by the parsed timestamp
            .map(
                (entry) =>
                    `<li>
                        <span data-pokemon="${entry.Pokemon_Name}" class="clickable">${entry.Pokemon_Name}</span> - 
                        <span data-player="${entry.Player_Name}" class="clickable">${entry.Player_Name}</span> 
                        (${entry.Spawn_Type}) at ${entry.parsedTimestamp.toLocaleString()}
                    </li>`
            )
            .join("");

        // Update the spawn list container
        const spawnListContainer = document.getElementById("spawnListContainer");
        spawnListContainer.innerHTML = `
            <h2>Latest Spawns</h2>
            <ul>
                ${sortedSpawns}
            </ul>
        `;
        const footerTimeElem = document.getElementById("footerTime");
        if (footerTimeElem && data.length > 0) {
            // data is already sorted, so the first entry is the latest
            const latest = data[data.length - 1];
            footerTimeElem.innerHTML = `&copy; Latest updated: ${latest.parsedTimestamp.toLocaleString()}`;
        }
    }

    // Utility function to generate random colors
    function getRandomColor() {
        return `#${Math.floor(Math.random() * 16777215).toString(16)}`;
    }

    // Event listener for dropdown selection
    selectHistory.addEventListener("change", (event) => {
        const value = event.target.value;
        if (value === "legendary") {
            updateData("/legendaryHistory");
        } else if (value === "ultrabeast") {
            updateData("/ultrabeastHistory");
        }
    });

    // Initialize with legendary history
    updateData("/legendaryHistory");
});