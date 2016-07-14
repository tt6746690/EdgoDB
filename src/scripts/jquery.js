
$(document).ready(function(){

  // scrollspy behaviour
  $("body").scrollspy({
      target: "#target_nav",
      offset: 50
  })


  if (typeof window.variant !== 'undefined'){
    // ajax call to fetch variant box
    variant.forEach(function(v){
      var variant_aa_id = v.MUT_HGVS_AA
      $.ajax({
          url: document.location.protocol +"//"+ document.location.hostname + ':' + document.location.port + document.location.pathname + '/variantBoxAjax',
          type: 'GET',
          data : {
            'variant_aa_id': variant_aa_id
          },
          success: function(data) {
            // console.log(data)
            $('#' + variant_aa_id + '_cardbox').html(data);
          }
      });
    })
  }


})
