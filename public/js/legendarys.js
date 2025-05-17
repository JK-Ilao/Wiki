document.addEventListener('DOMContentLoaded', (event) => {
    fetch('/data')
      .then(response => {
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        return response.json();
      })
      .then(data => {
        const container = document.getElementById('data-container'); // Ensure there's a div with id="data-container" in your HTML
        data.forEach(row => {
            const containerElement = document.createElement('div');
            containerElement.className = 'container';
          
            const imageElement = document.createElement('img');
            if(row.Dex < 1009) {
                if(row.Name.includes('Galarian')){
                  imageElement.src = `https://pokepast.es/img/pokemon/${row.Dex}-1.png`;
                } 
                else{
                  imageElement.src = `https://pokepast.es/img/pokemon/${row.Dex}-0.png`;
                }
            } else {
              imageElement.src = `https://img.pokemondb.net/sprites/scarlet-violet/normal/${row.Name.replace(/ /g, '-').toLowerCase()}.png`;
            }
            containerElement.appendChild(imageElement);
          
            const textContainerElement = document.createElement('div');
            textContainerElement.className = 'text-container';
          
            const nameElement = document.createElement('p');
            nameElement.innerHTML = `<a href="/Details?type=Name&value=${row.Name}">${row.Name}</a>`;
            textContainerElement.appendChild(nameElement);
          
            if (row.Biome) {
              const biomesElement = document.createElement('p');
              const biomes = row.Biome.split('-');
              biomesElement.innerHTML = `Biomes: ${biomes.map(biome => `<a href="/Details?type=Biome&value=${biome}">${biome}</a>`).join('<br>')}`;
              textContainerElement.appendChild(biomesElement);
            }
          
            if (row.Time) {
              const timeElement = document.createElement('p');
              timeElement.innerHTML = `Time: <a href="/Details?type=Time&value=${row.Time}">${row.Time}</a>`;
              textContainerElement.appendChild(timeElement);
            }
          
            if (row.Weather) {
              const weatherElement = document.createElement('p');
              weatherElement.innerHTML = `Weather: ${row.Weather === '-' ? 'None' : `<a href="/Details?type=Weather&value=${row.Weather}">${row.Weather}</a>`}`;
              textContainerElement.appendChild(weatherElement);
            }
          
            if (row.Condition) {
              const conditionElement = document.createElement('p');
              conditionElement.innerHTML = `Condition: ${row.Condition === '-' ? 'None' : `<a href="/Details?type=Condition&value=${row.Condition}">${row.Condition}</a>`}`;
              textContainerElement.appendChild(conditionElement);
            }
          
            containerElement.appendChild(textContainerElement);
            document.getElementById('details').appendChild(containerElement);
          });
      })
      .catch(e => console.error('Error:', e));
  });