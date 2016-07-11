
$(document).ready(function(){
  // $(c).one('click', function (e) {
    // e.preventDefault();
    // $.trim($('a#variantBoxAjax').text())
    variant.forEach(function(v){
      var variant_aa_id = v.MUT_HGVS_AA
      $.ajax({
          url: document.location.protocol +"//"+ document.location.hostname + ':' + document.location.port + document.location.pathname + '/variantBoxAjax',
          type: 'GET',
          data : {
            'variant_aa_id': variant_aa_id
          },
          success: function(data) {
            console.log(data)
            $('#' + variant_aa_id + '_cardbox').html(data);
          }
      });
    })

  // });
})
