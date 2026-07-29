var book;
var bookUrl;
var rendition;
var currentFontSize = getDefaultFontSize();

function getDefaultFontSize() {
  return window.matchMedia('(max-width: 768px)').matches ? 14 : 24;
}

function getSelectedFontSize() {
  var value = parseInt($('#fontSize').val(), 10);

  return Number.isFinite(value) ? value : getDefaultFontSize();
}

function syncFontSizeInput() {
  currentFontSize = getDefaultFontSize();
  $('#fontSize').val(currentFontSize);
}

function getContentStyles(fontSize) {
  const isMobile = window.matchMedia('(max-width: 768px)').matches;

  return {
    body: {
      overflow: 'hidden !important',
      color: 'white !important',
      background: 'black !important',
      'font-family': 'Arial, sans-serif !important',
      'font-size': fontSize + ' !important',
      'word-spacing': 'normal !important',
      'letter-spacing': 'normal !important',
      'line-height': isMobile ? '1.35 !important' : '1.5 !important',
      'text-align': 'left !important',
    },
    'body *': {
      color: 'white !important',
      'font-size': fontSize + ' !important',
      'word-spacing': 'normal !important',
      'letter-spacing': 'normal !important',
      'line-height': 'inherit !important',
      'text-align': 'left !important',
    },
    p: {
      'font-size': fontSize + ' !important',
    },
    h1: {
      'font-size': fontSize + ' !important',
    },
    h2: {
      'font-size': fontSize + ' !important',
    },
    h3: {
      'font-size': fontSize + ' !important',
    },
    h4: {
      'font-size': fontSize + ' !important',
    },
    h5: {
      'font-size': fontSize + ' !important',
    },
    h6: {
      'font-size': fontSize + ' !important',
    },
    span: {
      'font-size': fontSize + ' !important',
    },
    div: {
      'font-size': fontSize + ' !important',
    },
    li: {
      'font-size': fontSize + ' !important',
    },
    a: {
      'font-size': fontSize + ' !important',
    },
    blockquote: {
      'font-size': fontSize + ' !important',
    },
    pre: {
      'font-size': fontSize + ' !important',
    },
    code: {
      'font-size': fontSize + ' !important',
    },
    img: {
      display: 'block !important',
      'max-width': '100% !important',
      'max-height': 'calc(100vh - 2rem) !important',
      width: 'auto !important',
      height: 'auto !important',
      margin: '0 auto !important',
      'object-fit': 'contain !important',
      'page-break-inside': 'avoid !important',
      'break-inside': 'avoid !important',
    },
    svg: {
      display: 'block !important',
      'max-width': '100% !important',
      'max-height': 'calc(100vh - 2rem) !important',
      margin: '0 auto !important',
    },
  };
}

function getViewerSize() {
  const viewer = document.getElementById('epub-contents');

  if (!viewer) {
    return { width: window.innerWidth, height: window.innerHeight };
  }

  return {
    width: viewer.clientWidth,
    height: viewer.clientHeight,
  };
}

function resizeRendition() {
  if (rendition && typeof rendition.resize === 'function') {
    const size = getViewerSize();
    rendition.resize(size.width, size.height);
  }
}

function setTopControlsLoaded(isLoaded) {
  $('.pWindow').toggleClass('reader-loaded', isLoaded);
}

function setEmptyState(isEmpty) {
  $('.epub-read-container').toggleClass('empty', isEmpty);
}

function resetReader() {
  if (rendition) {
    rendition.destroy();
    rendition = null;
  }

  if (book) {
    book = null;
  }

  $('#input-book').val('');
  syncFontSizeInput();
  setTopControlsLoaded(false);
  setEmptyState(true);
  location.reload();
}

$('#resetReader').on('click', function () {
  resetReader();
});

setEmptyState(true);
syncFontSizeInput();

function loadEpubFromFile(file) {
  if (
    !file ||
    (file.type !== 'application/epub+zip' && !/\.epub$/i.test(file.name))
  ) {
    return;
  }

  currentFontSize = getDefaultFontSize();
  $('#fontSize').val(currentFontSize);

  var reader = new FileReader();

  reader.onload = function (event) {
    var data = event.target.result;
    book = ePub(data);
    console.log('Livro carregado na memoria e pronto para uso.');
    setTopControlsLoaded(true);
    setEmptyState(false);

    var fontSize = currentFontSize;

    // Renderizar automaticamente após carregar
    book.ready.then(function () {
      if (rendition) {
        rendition.destroy();
      }

      rendition = book.renderTo('epub-contents', {
        method: 'default',
        width: '100%',
        height: '100%',
        flow: 'paginated',
        spread: 'none',
        minSpreadWidth: 1200,
        manager: 'default',
      });
      rendition.hooks.content.register(function (contents) {
        contents.addStylesheetRules(getContentStyles(fontSize + 'px'));
        registerKeyboardNavigation(contents);
      });
      rendition.display();
      resizeRendition();
    });
  };

  reader.readAsArrayBuffer(file);
}

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
  currentFontSize = getSelectedFontSize();
  var font = currentFontSize;
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
    contents.addStylesheetRules(getContentStyles(font + 'px'));
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
    loadEpubFromFile(file);
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

$(window).on('resize orientationchange', function () {
  resizeRendition();
});

$(document).on('dragenter dragover', function (e) {
  if (!book) {
    e.preventDefault();
    e.stopPropagation();
  }
});

$(document).on('drop', function (e) {
  if (book) {
    return;
  }

  e.preventDefault();
  e.stopPropagation();

  var files = e.originalEvent.dataTransfer.files;
  if (files && files.length > 0) {
    loadEpubFromFile(files[0]);
  }
});

// Manipulador de evento para o botão de alternância de visualização em página única/dupla
$('#spread').on('click', function () {
  if (book && rendition) {
    let currentCfi = rendition.currentLocation().start.cfi;
    let font = getSelectedFontSize();

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
      contents.addStylesheetRules(getContentStyles(font + 'px'));
      registerKeyboardNavigation(contents);
    });
    rendition.display(currentCfi);

    $(this).text(newSpread === 'none' ? 'One page' : 'Two pages');
  }
});
