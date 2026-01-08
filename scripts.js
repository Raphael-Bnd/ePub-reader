var book;
var bookUrl;
var rendition;

// Função para registrar a navegação por teclado
function registerKeyboardNavigation(contents) {
  contents.document.addEventListener('keydown', function (e) {
    if (e.key === 'ArrowLeft') {
      rendition.prev();
    } else if (e.key === 'ArrowRight') {
      rendition.next();
    }
  });
}

// Manipulador de evento para mudança de tamanho da fonte
$('#fontSize').on('change', function () {
  let currentCfi = rendition.currentLocation().start.cfi;
  var font = $(this).val();
  if (rendition) {
    let newSpread = rendition.settings.spread;
    let newMinSpread = rendition.minSpreadWidth;

    rendition.destroy();

    rendition = book.renderTo('epub-contents', {
      width: '100%',
      height: '100%',
      flow: 'paginated',
      manager: 'default',
      spread: newSpread,
      minSpreadWidth: newMinSpread,
    });
  }
  // Aplicar as novas regras de estilo com o tamanho da fonte atualizado
  rendition.hooks.content.register(function (contents) {
    contents.addStylesheetRules({
      body: {
        overflow: 'hidden !important',
        color: 'white !important',
        background: 'transparent !important',
        'font-family': 'Arial, sans-serif !important',
      },
      p: {
        color: 'white !important',
        'font-size': font + 'px' + ' !important',
      },
    });
    registerKeyboardNavigation(contents);
    $(this).blur();
  });
  rendition.display(currentCfi);
});

// Manipuladores de eventos para o botão de tamanho da fonte
$('#fontSize').on({
  click: function () {
    $(this).toggleClass('inactive');
  },
  mouseenter: function () {
    $(this).addClass('active');
  },
  mouseleave: function () {
    $(this).removeClass('active');
  },
  blur: function () {
    $(this).removeClass('active').addClass('inactive');
  },
});

// Manipulador de evento para seleção de arquivo e carregamento do livro
$('#input-book').on('change', function () {
  var file = $(this).prop('files')[0];

  if (file) {
    var reader = new FileReader();

    reader.onload = function (event) {
      var data = event.target.result;
      book = ePub(data);
      console.log('Livro carregado na memoria e pronto para uso.');

      // Renderizar automaticamente após carregar
      book.ready.then(function () {
        if (rendition) {
          rendition.destroy();
        }

        rendition = book.renderTo('epub-contents', {
          method: 'default',
          width: '100%',
          height: 750,
          flow: 'paginated',
          spread: 'none',
          minSpreadWidth: 1200,
          manager: 'default',
        });
        rendition.hooks.content.register(function (contents) {
          contents.addStylesheetRules({
            body: {
              overflow: 'hidden !important',
              color: 'white !important',
              background: 'transparent !important',
              'font-family': 'Arial, sans-serif !important',
            },
            p: {
              color: 'white !important',
              'font-size': '24px !important',
            },
          });
          registerKeyboardNavigation(contents);
        });
        rendition.display();
      });
    };
    reader.readAsArrayBuffer(file);
  }
});

// Manipulador de evento para o botão de submissão e renderização do livro
$('.submitButton').on('click', function () {
  if (book && rendition) {
    rendition.destroy();
  }
  if (book) {
    book.ready.then(function () {
      var viewer = document.getElementById('epub-contents');

      $('.epub-contents').empty();

      rendition = book.renderTo('epub-contents', {
        method: 'default',
        width: '100%',
        height: 750,
        flow: 'paginated',
        spread: 'none',
        minSpreadWidth: 1200,
        manager: 'default',
      });
      rendition.hooks.content.register(function (contents) {
        contents.addStylesheetRules({
          body: {
            overflow: 'hidden !important',
            color: 'white !important',
            background: 'transparent !important',
            'font-family': 'Arial, sans-serif !important',
          },
          p: {
            color: 'white !important',
            'font-size': '24px !important',
          },
        });
        registerKeyboardNavigation(contents);
      });
      rendition.display();
    });
  } else {
    alert('Select an ePub file first.');
  }
});

// Manipuladores de evento para o botão de voltar página
$('#prevPage').on('click', function () {
  if (rendition) {
    rendition.prev();
  }
});

// Manipulador de evento para o botão de próxima página
$('#nextPage').on('click', function () {
  if (rendition) {
    rendition.next();
  }
});

// Manipulador de evento para navegação por setas do teclado
$(document).on('keydown', function (e) {
  if (rendition) {
    if (e.key === 'ArrowLeft') {
      rendition.prev();
    } else if (e.key === 'ArrowRight') {
      rendition.next();
    }
  }
});

// Manipulador de evento para o botão de alternância de visualização em página única/dupla
$('#spread').on('click', function () {
  if (book && rendition) {
    let currentCfi = rendition.currentLocation().start.cfi;

    let newSpread = rendition.settings.spread === 'none' ? 'auto' : 'none';
    let newMinSpread = newSpread === 'auto' ? 800 : 10000;

    rendition.destroy();

    rendition = book.renderTo('epub-contents', {
      width: '100%',
      height: '100%',
      flow: 'paginated',
      manager: 'default',
      spread: newSpread,
      minSpreadWidth: newMinSpread,
    });

    rendition.hooks.content.register(function (contents) {
      contents.addStylesheetRules({
        body: {
          overflow: 'hidden !important',
          color: 'white !important',
          background: 'transparent !important',
          'font-family': 'Arial, sans-serif !important',
        },
        p: {
          color: 'white !important',
          'font-size': '24px !important',
        },
      });
      registerKeyboardNavigation(contents);
    });
    rendition.display(currentCfi);

    $(this).text(newSpread === 'none' ? 'One page' : 'Two pages');
  }
});
