'use strict';

var genes = new Bloodhound({
  datumTokenizer: Bloodhound.tokenizers.whitespace,
  queryTokenizer: Bloodhound.tokenizers.whitespace,
  // url points to a json file that contains an array of country names, see
  // https://github.com/twitter/typeahead.js/blob/gh-pages/data/countries.json
  prefetch: '../data/genes.json'
});

var variants = new Bloodhound({
  datumTokenizer: Bloodhound.tokenizers.whitespace,
  queryTokenizer: Bloodhound.tokenizers.whitespace,
  // url points to a json file that contains an array of country names, see
  // https://github.com/twitter/typeahead.js/blob/gh-pages/data/countries.json
  prefetch: '../data/variants.json'
});

$(document).ready(function(){
  $('input.typeahead').typeahead({
      highlight: true
    }, {
      name: 'genes',
      source: genes,
      templates: {
        header: '<h3 class="searchbar-header-genes">Genes</h3>'
      }
    }, {
      name: 'variants',
      source: variants,
      templates: {
        header: '<h3 class="searchbar-header-variants">Variants</h3>'
    }
  });
});


$(document).ready(function(){
  $('input.typeahead').bind('typeahead:select', function(ev, suggestion) {
    if (/^NM_[0-9]{5,}/i.test(suggestion)) {
      window.location.href = '/variant/' + suggestion;
    }
    else {
      window.location.href = '/gene/' + suggestion;
    }
  });
});
