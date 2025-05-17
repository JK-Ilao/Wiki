document.addEventListener('DOMContentLoaded', (event) => {
    fetch('/pricesPokes')
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
            
            const textContainerElement = document.createElement('div');
            textContainerElement.className = 'text-container';
            
            const nameElement = document.createElement('p');
            nameElement.textContent = row.Type;
            textContainerElement.appendChild(nameElement);
            
            const priceElement = document.createElement('p');
            priceElement.textContent = `Price: ${row.Price}`;
            textContainerElement.appendChild(priceElement);

            const IfLeggyElement = document.createElement('p');
            if(row['If Leggy'] !== '-'){
                IfLeggyElement.textContent = `If Legendary or UltraBeast Add: ${row['If Leggy']}`;
                textContainerElement.appendChild(IfLeggyElement);
            }

            containerElement.appendChild(textContainerElement);
            details.appendChild(containerElement);
        }
      })
      .catch(e => console.error('Error:', e));
});