document.addEventListener('DOMContentLoaded', (event) => {
    fetch('/pricesMisc')
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
            if(row.Name !== 'Red Orb' && row.Name !== 'Blue Orb' && row.Name !== 'Zygarde Cell' && row.Name !== 'Zygarde Core'){
              imageElement.src = `https://pixelmonmod.com/w/images${row.Id}`;
              imageElement.style.maxWidth = '32px';
              imageElement.style.maxHeight = '32px';
            }
            else{
                imageElement.src = `https://archives.bulbagarden.net/media/upload${row.Id}`;
                imageElement.style.maxWidth = '32px';
                imageElement.style.maxHeight = '32px';
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

            containerElement.appendChild(textContainerElement);
            details.appendChild(containerElement);
        }
      })
      .catch(e => console.error('Error:', e));
});