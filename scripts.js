var book;
var bookUrl;
var rendition;

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
    $(this).blur();
  });
  rendition.display(currentCfi);
});

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

$('#input-book').on('change', function () {
  var file = $(this).prop('files')[0];

  if (file) {
    var reader = new FileReader();

    reader.onload = function (event) {
      var data = event.target.result;
      book = ePub(data);
      console.log('Livro carregado na memoria e pronto para uso.');
    };
    reader.readAsArrayBuffer(file);
  }
});

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
      });
      rendition.display();
    });
  } else {
    alert('Select an ePub file first.');
  }
});

$('#prevPage').on('click', function () {
  if (rendition) {
    rendition.prev();
  }
});

$('#nextPage').on('click', function () {
  if (rendition) {
    rendition.next();
  }
});

$('#nextPage').on('keydown', function () {
  if (rendition && e.key === "ArrowLeft") {
    rendition.next();
  }
});

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
    });
    rendition.display(currentCfi);

    $(this).text(newSpread === 'none' ? 'One page' : 'Two pages');
  }
});
