// Get the query parameters from the URL
const urlParams = new URLSearchParams(window.location.search);
const type = urlParams.get('type');
const value = urlParams.get('value');

const header = document.createElement('h1');
header.textContent = value;
document.body.prepend(header); // Adds the header at the top of the body

// Make a request to the server-side endpoint
fetch(`/pokemon?type=${type}&value=${value}`)
  .then(response => response.json())
  .then(rows => {
    console.log('Request successful:', rows);
    document.title = `${value}`;
    const details = document.getElementById('details');
    for (let row of rows) {
      const containerElement = document.createElement('div');
      containerElement.className = 'container';

      const imageElement = document.createElement('img');
      if(row.Dex < 1009) {
        imageElement.src = `https://pokepast.es/img/pokemon/${row.Dex}-0.png`;
      } else {
        imageElement.src = `https://img.pokemondb.net/sprites/scarlet-violet/normal/${row.Name.replace(/ /g, '-').toLowerCase()}.png`;
      }
      containerElement.appendChild(imageElement);

      const textContainerElement = document.createElement('div');
      textContainerElement.className = 'text-container';

      const nameElement = document.createElement('p'); // Create a new paragraph element for the name
      nameElement.innerHTML = `<a href="/Details?type=Name&value=${row.Name}">${row.Name}</a>`;
      textContainerElement.appendChild(nameElement);

      const biomesElement = document.createElement('p');
      const biomes = row.Biome.split('-');
      biomesElement.innerHTML = `Biomes: ${biomes.map(biome => `<a href="/Details?type=Biome&value=${biome}">${biome}</a>`).join('<br>')}`;
      textContainerElement.appendChild(biomesElement);

      const timeElement = document.createElement('p');
      timeElement.innerHTML = `Time: <a href="/Details?type=Time&value=${row.Time}">${row.Time}</a>`;
      textContainerElement.appendChild(timeElement);

      const weatherElement = document.createElement('p');
      weatherElement.innerHTML = `Weather: ${row.Weather === '-' ? 'None' : `<a href="/Details?type=Weather&value=${row.Weather}">${row.Weather}</a>`}`;
      textContainerElement.appendChild(weatherElement);

      const conditionElement = document.createElement('p');
      if (row.Condition && typeof row.Condition === 'string') {
          conditionElement.innerHTML = `Condition: ${row.Condition === '-' ? 'None' : `<a href="/Details?type=Condition&value=${row.Condition}">${row.Condition}</a>`}`;
      } else {
          conditionElement.innerHTML = 'Condition: Invalid value';
      }
      textContainerElement.appendChild(conditionElement);

      containerElement.appendChild(textContainerElement);
      details.appendChild(containerElement);
    }
  })
  .catch(error => console.error('Error:', error));