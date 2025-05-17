document.addEventListener('DOMContentLoaded', (event) => {
    fetch('/pricesLeggy')
      .then(response => {
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        return response.json();
      })
      .then(data => {
        const details = document.getElementById('prices');
        for (let row of data) {
        //   console.log(row);
          const containerElement = document.createElement('div');
          containerElement.className = 'container';
  
          const imageElement = document.createElement('img');
          if (row.Dex.includes('-')) {
            if(row.Dex < 1009) {
              imageElement.src = `https://pokepast.es/img/pokemon/${row.Dex}.png`;
            } else {
              imageElement.src = `https://img.pokemondb.net/sprites/scarlet-violet/normal/${row.Name.replace(/ /g, '-').toLowerCase()}.png`;
            }
              imageElement.style.maxWidth = '172px';
              imageElement.style.maxHeight = '172px';
          } else {
            if(row.Dex < 1009) {
              imageElement.src = `https://pokepast.es/img/pokemon/${row.Dex}-0.png`;
            } else {
              imageElement.src = `https://img.pokemondb.net/sprites/scarlet-violet/normal/${row.Name.replace(/ /g, '-').toLowerCase()}.png`;
            }
              imageElement.style.maxWidth = '172px';
              imageElement.style.maxHeight = '172px';
              // console.log(row.Dex);
          }
          containerElement.appendChild(imageElement);
  
          const textContainerElement = document.createElement('div');
          textContainerElement.className = 'text-container';
  
          const nameElement = document.createElement('p');
          nameElement.textContent = row.Name;
          textContainerElement.appendChild(nameElement);
  
          const priceElement = document.createElement('p');
          priceElement.textContent = `Price: ${row.Price}`;
          textContainerElement.appendChild(priceElement);
  
          const fusedElement = document.createElement('p');
          if (row['If fused'] !== '-') {
              fusedElement.textContent = `If Fused Add: ${row['If fused']}`;
              textContainerElement.appendChild(fusedElement);
          }
          
          const perCloneAttemptElement = document.createElement('p');
          if (row['Per clone attempt'] !== '-') {
              perCloneAttemptElement.textContent = `Per Clone Attempt Decrese: ${row['Per clone attempt']}`;
              textContainerElement.appendChild(perCloneAttemptElement);
          }
  
          containerElement.appendChild(textContainerElement);
          details.appendChild(containerElement);
        }
      })
      .then(() => {
        return fetch('/pricesUltra');
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
          //   console.log(row);
            const containerElement = document.createElement('div');
            containerElement.className = 'container';
    
            const imageElement = document.createElement('img');
            imageElement.src = `https://pokepast.es/img/pokemon/${row.Dex}-0.png`;
            imageElement.style.maxWidth = '172px';
            imageElement.style.maxHeight = '172px';
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
