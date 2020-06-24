window['configuration'] = fetch('./config.json', {
    method: 'GET',
    headers: {
        'Content-Type': 'application/json',
    }
}).then(
    response => response.json()
);