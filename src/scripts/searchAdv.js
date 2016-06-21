'use strict';

$(document).ready(function(){

  $('form#advanceSearch').submit(function (e) {
    e.preventDefault();
    $.ajax({
        url: '/search',
        type: 'POST',
        data : $('#advanceSearch').serialize(),
        success: function(data) {
          console.log(data)
           $('#searchResult').html(data);
        }
    });
  });
//http://stackoverflow.com/questions/1200266/submit-a-form-using-jquery

  var chromosomeLocation= new Bloodhound({
    datumTokenizer: Bloodhound.tokenizers.whitespace,
    queryTokenizer: Bloodhound.tokenizers.whitespace,
    prefetch: '../data/Gene.CHROMOSOME_NAME.json'
  });

  var inPfam = new Bloodhound({
    datumTokenizer: Bloodhound.tokenizers.whitespace,
    queryTokenizer: Bloodhound.tokenizers.whitespace,
    prefetch: '../data/VariantProperty.IN_PFAM.json'
  });

  var inMotif = new Bloodhound({
    datumTokenizer: Bloodhound.tokenizers.whitespace,
    queryTokenizer: Bloodhound.tokenizers.whitespace,
    prefetch: '../data/VariantProperty.IN_MOTIF.json'
  });

  var clinVarSig= new Bloodhound({
    datumTokenizer: Bloodhound.tokenizers.whitespace,
    queryTokenizer: Bloodhound.tokenizers.whitespace,
    prefetch: '../data/VariantProperty.CLINVAR_CLINICAL_SIGNIFICANCE.json'
  });


  $('input.chrName-typeahead').typeahead({
    highlight: true
  }, {
    name: 'chromosomeLocation',
    source: chromosomeLocation
  });


  $('input.inPfam-typeahead').typeahead({
    highlight: true
  }, {
    name: 'inPfam',
    source: inPfam
  })

  $('input.inMotif-typeahead').typeahead({
    highlight: true
  }, {
    name: 'inMotif',
    source: inMotif
  })

  $('input.clinVarSig-typeahead').typeahead({
    highlight: true
  }, {
    name: 'clinVarSig',
    source: clinVarSig
  })

});

//
// $(document).ready(function(){
//   $('input.typeahead').bind('typeahead:select', function(ev, suggestion) {
//
//   });
// });
