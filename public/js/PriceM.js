document.addEventListener('DOMContentLoaded', (event) => {
    fetch('/pricesMega')
      .then(response => {
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        return response.json();
      })
      .then(data => {
        const details = document.getElementById('prices');
        for (let row of data) {
            //console.log(row);
            const containerElement = document.createElement('div');
            containerElement.className = 'container';

            const imageElement = document.createElement('img');
            imageElement.src = `https://img.pokemondb.net/sprites/items/${row.Id}.png`;
            imageElement.style.maxWidth = '32px';
            imageElement.style.maxHeight = '32px';
            containerElement.appendChild(imageElement);
            const textContainerElement = document.createElement('div');
            textContainerElement.className = 'text-container';
            
            const nameElement = document.createElement('p');
            nameElement.textContent = row.Name;
            textContainerElement.appendChild(nameElement);
            
            const priceElement = document.createElement('p');
            priceElement.textContent = `Price: ${row.Price}`;
            textContainerElement.appendChild(priceElement);

            containerElement.appendChild(textContainerElement);
            details.appendChild(containerElement);
        }
      })
      .then(() => {
        return fetch('/pricesZcrys');
      })
      .then(response => {
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        return response.json();
      })
      .then(data => {
        const details = document.getElementById('prices');
        for (let row of data) {
          //console.log(row);
          const containerElement = document.createElement('div');
          containerElement.className = 'container';

          const imageElement = document.createElement('img');
          imageElement.src = `https://img.pokemondb.net/sprites/items/${row.Id}.png`;
          imageElement.style.maxWidth = '32px';
          imageElement.style.maxHeight = '32px';
          containerElement.appendChild(imageElement);
          const textContainerElement = document.createElement('div');
          textContainerElement.className = 'text-container';
          
          const nameElement = document.createElement('p');
          nameElement.textContent = row.Name;
          textContainerElement.appendChild(nameElement);
          
          const priceElement = document.createElement('p');
          priceElement.textContent = `Price: ${row.Price}`;
          textContainerElement.appendChild(priceElement);

          containerElement.appendChild(textContainerElement);
          details.appendChild(containerElement);
        }
      })
      .catch(e => console.error('Error:', e));
});