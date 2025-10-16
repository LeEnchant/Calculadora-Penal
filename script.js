document.addEventListener('DOMContentLoaded', () => {
    const nomeClienteInput = document.getElementById('nome-cliente');
    const rgClienteInput = document.getElementById('rg-cliente');
    const nomeAdvogadoInput = document.getElementById('nome-advogado');
    const rgAdvogadoInput = document.getElementById('rg-advogado');
    const inputDinheiroSujo = document.getElementById('valor-dinheiro-sujo');
    const artigosContainer = document.querySelectorAll('.artigos-container');
    const atenuantesList = document.querySelectorAll('.atenuante');
    const inputPena = document.getElementById('input-pena');
    const inputMulta = document.getElementById('input-multa');
    const inputFianca = document.getElementById('input-fianca');
    const btnCopiar = document.getElementById('btn-copiar');
    const btnDeletar = document.getElementById('btn-deletar');
    const artigosSelecionadosContainer = document.getElementById('artigos-selecionados-container');
    
    let artigosSelecionados = [];

    const inafiancaveis = [101, 102, 103, 104, 105, 106, 107, 108, 179, 204];
    const fiancaPagaElement = document.querySelector('[data-atenuante="fianca_paga"]');

    const formatarValor = (valor) => `R$ ${valor.toFixed(2).replace('.', ',').replace(/\B(?=(\d{3})+(?!\d))/g, '.')}`;

    const atualizarCalculos = () => {
        let penaTotal = artigosSelecionados.reduce((acc, curr) => acc + curr.pena, 0);
        let multaTotal = artigosSelecionados.reduce((acc, curr) => acc + curr.multa, 0);
        
        const temInafiancavel = artigosSelecionados.some(artigo => inafiancaveis.includes(parseInt(artigo.artigo)));
        
        if (temInafiancavel) {
            inputFianca.value = 'INAFIANÇÁVEL';
            fiancaPagaElement.classList.add('nao-fiancavel');
            fiancaPagaElement.classList.remove('selecionado');
        } else {
            let fiancaTotal = 250000 + multaTotal;
            inputFianca.value = formatarValor(fiancaTotal);
            fiancaPagaElement.classList.remove('nao-fiancavel');
        }

        // Nova lógica para a fiança paga
        if (fiancaPagaElement.classList.contains('selecionado')) {
            penaTotal = 1;
        } else {
            const atenuantesSelecionadas = document.querySelectorAll('.atenuante.selecionado');
            atenuantesSelecionadas.forEach(atenuante => {
                switch (atenuante.dataset.atenuante) {
                    case 'advogado':
                        penaTotal *= 0.75;
                        break;
                    case 'primario':
                        penaTotal *= 0.80;
                        break;
                    case 'confesso':
                        penaTotal *= 0.50;
                        break;
                    default:
                        break;
                }
            });
        }

        inputPena.value = `${Math.round(penaTotal)} meses`;
        inputMulta.value = formatarValor(multaTotal);
    };

    const atualizarListaCrimes = () => {
        artigosSelecionadosContainer.innerHTML = '';

        artigosSelecionados.forEach(artigo => {
            const item = document.createElement('div');
            item.classList.add('artigo-selecionado-lista');
            item.textContent = `Art. ${artigo.artigo} - ${artigo.descricao.split(' - ')[1]}`;
            artigosSelecionadosContainer.appendChild(item);
        });
    };

    artigosContainer.forEach(container => {
        container.addEventListener('click', (event) => {
            const quadro = event.target.closest('.artigo-quadro');
            if (quadro) {
                const artigoData = {
                    artigo: quadro.dataset.artigo,
                    pena: parseInt(quadro.dataset.pena),
                    multa: parseInt(quadro.dataset.multa),
                    descricao: quadro.querySelector('p').textContent,
                    fianca: quadro.dataset.fianca
                };
                
                const index = artigosSelecionados.findIndex(item => item.artigo === artigoData.artigo);
                
                if (index > -1) {
                    artigosSelecionados.splice(index, 1);
                    quadro.classList.remove('selecionado');
                } else {
                    artigosSelecionados.push(artigoData);
                    quadro.classList.add('selecionado');
                }
                
                atualizarCalculos();
                atualizarListaCrimes();
            }
        });
    });

    inputDinheiroSujo.addEventListener('input', () => {
        const valor = parseFloat(inputDinheiroSujo.value.replace(/\D/g, ''));
        
        artigosSelecionados = artigosSelecionados.filter(item => item.artigo !== '131' && item.artigo !== '132');
        
        const artigo131Element = document.querySelector('[data-artigo="131"]');
        const artigo132Element = document.querySelector('[data-artigo="132"]');
        
        if (artigo131Element) artigo131Element.classList.remove('selecionado');
        if (artigo132Element) artigo132Element.classList.remove('selecionado');

        if (valor > 1000) {
            artigosSelecionados.push({
                artigo: '132',
                pena: 30,
                multa: 60000,
                descricao: 'Art. 132 - Posse de dinheiro sujo (1001 a ???)'
            });
            if (artigo132Element) artigo132Element.classList.add('selecionado');
        } else if (valor > 0) {
            artigosSelecionados.push({
                artigo: '131',
                pena: 0,
                multa: 20000,
                descricao: 'Art. 131 - Posse de dinheiro sujo (1 a 1000)'
            });
            if (artigo131Element) artigo131Element.classList.add('selecionado');
        }

        atualizarCalculos();
        atualizarListaCrimes();
    });

    atenuantesList.forEach(item => {
        item.addEventListener('click', () => {
            if (!item.classList.contains('nao-fiancavel')) {
                item.classList.toggle('selecionado');
                atualizarCalculos();
            }
        });
    });

    const gerarTextoDeCopiar = () => {
        const nomeCliente = nomeClienteInput.value || 'NÃO INFORMADO';
        const rgCliente = rgClienteInput.value || 'NÃO INFORMADO';
        const nomeAdvogado = nomeAdvogadoInput.value || 'NÃO INFORMADO';
        const rgAdvogado = rgAdvogadoInput.value || 'NÃO INFORMADO';
        
        const dinheiroSujo = inputDinheiroSujo.value || 'SEM POSSE';
        const penaFinal = inputPena.value;
        const multaFinal = inputMulta.value;
        const fiancaFinal = inputFianca.value;
        
        const atenuantes = Array.from(document.querySelectorAll('.atenuante.selecionado')).map(atenuante => {
            const atenuanteData = atenuante.dataset.atenuante;
            
            if (atenuanteData === 'fianca_paga') {
                const isSelected = atenuante.classList.contains('selecionado');
                return `* 🔹 Fiança paga: ${isSelected ? 'Sim' : 'Não'}`;
            } else {
                const textoCompleto = atenuante.textContent.trim();
                return `* 🔹 ${textoCompleto.replace('🔹', '').trim()}`;
            }
        }).join('\n');

        const crimes = artigosSelecionados.map(artigo => {
            const partes = artigo.descricao.split(' - ');
            const descricao = partes.slice(1).join(' - ');
            return `* Art. ${artigo.artigo} - ${descricao}`;
        }).join('\n');

        const texto = `\`\`\`md
# INFORMAÇÕES DO PRESO
* Nome: ${nomeCliente}
* RG: ${rgCliente}
* Dinheiro Sujo: ${dinheiroSujo}

# CRIMES:
${crimes}

# ATENUANTES:
${atenuantes}

# RESULTADO FINAL
* Pena: ${penaFinal}
* Multa: ${multaFinal}
* Fiança: ${fiancaFinal}

# ADVOGADO:
* Nome: ${nomeAdvogado}
* RG: ${rgAdvogado}
\`\`\``;

        return texto;
    };

    btnCopiar.addEventListener('click', () => {
        const textoParaCopiar = gerarTextoDeCopiar();
        navigator.clipboard.writeText(textoParaCopiar)
            .then(() => alert('Informações copiadas para a área de transferência!'))
            .catch(err => console.error('Erro ao copiar: ', err));
    });

    btnDeletar.addEventListener('click', () => {
        nomeClienteInput.value = '';
        rgClienteInput.value = '';
        nomeAdvogadoInput.value = '';
        rgAdvogadoInput.value = '';
        inputDinheiroSujo.value = '';
        
        inputPena.value = '';
        inputMulta.value = '';
        inputFianca.value = '';

        artigosSelecionados = [];
        document.querySelectorAll('.artigo-quadro').forEach(quadro => quadro.classList.remove('selecionado'));
        artigosSelecionadosContainer.innerHTML = '';

        atenuantesList.forEach(item => item.classList.remove('selecionado'));
        fiancaPagaElement.classList.remove('nao-fiancavel');
    });
});
