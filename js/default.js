function obterFeriados(ano) {
    document.getElementById('loading').style.display = 'block';

    return new Promise((resolve, reject) => {
      fetch(`http://XXXXX/api/Holiday/${ano}`, {
        method: 'GET',
        headers: {
          'accept': 'text/plain'
        }
      }).then(response => {
        if (!response.ok) {
          throw new Error('Erro ao obter feriados');
        }
        return response.json();
      }).then(data => {
        feriados.length = 0;
        data.forEach(item => feriados.push(item));
        marcarFeriados();
        document.getElementById('loading').style.display = 'none';
        resolve();
      }).catch(error => {
        console.error('Erro ao obter feriados:', error);
        document.getElementById('loading').style.display = 'none';
        document.getElementById('error-message').style.display = 'block';
        setTimeout(() => {
          document.getElementById('error-message').style.display = 'none';
        }, 5000);
        reject(error);
      });
    });
  }

  const feriados = [];

  const meses = [
    'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
    'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
  ];


  let mesAtual = (new Date()).getMonth();
  let anoAtual = (new Date()).getFullYear();
  let anoSelecionado = anoAtual;

  function marcarFeriados() {
    const tbody = document.querySelector('#calendar tbody');
    const primeiroDiaDoMes = new Date(anoAtual, mesAtual, 1);
    const ultimoDiaDoMes = new Date(anoAtual, mesAtual + 1, 0);
    const diasNoMes = ultimoDiaDoMes.getDate();


    tbody.innerHTML = '';


    document.getElementById('month-year').textContent = `${meses[mesAtual]} de ${anoAtual}`;

    const primeiroDiaSemana = primeiroDiaDoMes.getDay();
    let diaAtual = 1;

    for (let i = 0; i < 6; i++) {
      const tr = tbody.insertRow();

      for (let j = 0; j < 7; j++) {
        const td = tr.insertCell();

        if (i === 0 && j < primeiroDiaSemana) {
          td.textContent = '';
        } else if (diaAtual <= diasNoMes) {
          td.textContent = diaAtual;

          // Verificando se a data é um feriado
          const dataAtual = new Date(anoAtual, mesAtual, diaAtual).toISOString().split('T')[0];
          const feriado = feriados.find(f => f.date === dataAtual);
          if (feriado) {
            td.classList.add('holiday');
            td.addEventListener('mouseover', function(event) {
              const popover = document.getElementById('popover');
              popover.innerHTML = `<b>Data:</b> ${feriado.date}<br><b>Nome:</b> ${feriado.name}<br><b>Tipo:</b> ${feriado.type}`;
              popover.style.left = `${event.pageX}px`;
              popover.style.top = `${event.pageY}px`;
              popover.classList.add('active');
            });
            td.addEventListener('mouseout', function() {
              const popover = document.getElementById('popover');
              popover.innerHTML = '';
              popover.classList.remove('active');
            });
          }

          diaAtual++;
        }
      }
    }
  }

  // Event listener para o botão "Mês Anterior"
  document.getElementById('previousMonth').addEventListener('click', function() {
    if (mesAtual === 0) {
      mesAtual = 11;
      anoAtual--;
    } else {
      mesAtual--;
    }
    marcarFeriados();
  });

  // Event listener para o botão "Próximo Mês"
  document.getElementById('nextMonth').addEventListener('click', function() {
    if (mesAtual === 11) {
      mesAtual = 0;
      anoAtual++;
    } else {
      mesAtual++;
    }
    marcarFeriados();
  });

  const monthYear = document.getElementById('month-year')

  const observer = new MutationObserver(function(mutations) {
        mutations.forEach(function(mutation) {
            if (mutation.type === 'childList' && mutation.target.nodeType === 1) {
                console.log('CHEGOUUUU', mutation.target.textContent);
                var text = mutation.target.textContent
                var year = parseInt(text.substring(text.length - 4))
                if (anoSelecionado !== year){
                    anoSelecionado = year
                    obterFeriados(anoSelecionado);
                }
            }
        });
    });

    const config = { childList: true, characterData: true, subtree: true };

    observer.observe(monthYear, config);

  obterFeriados(anoAtual);