
$(document).ready(function(){

  // scrollspy behaviour
  $("body").scrollspy({
      target: "#target_nav",
      offset: 50
  })


  $('[data-toggle="tooltip"]').tooltip()

  $('#showToolTip').click(function(){
    $('.showToolTip').tooltip('toggle')
  })

  // damn definitely use REACT/REDUX for this later. STATE!!!
  // variant.forEach(function(v){
  //   $('.nav-tabs a[href="#' + v.MUT_HGVS_AA + '_cardbox"]').click(function() {
  //     $('#' + v.MUT_HGVS_AA + '_needleHead').d3Click();
  //   });
  // })

  //
  // $('#downloadData').click(function(){
  //   window.location = document.location.protocol +"//"+ document.location.hostname + ':' + document.location.port + document.location.pathname + '/download'
  // })



  // not using ajax. bad practice
  // if (typeof window.variant !== 'undefined'){
  //   // ajax call to fetch variant box
  //   variant.forEach(function(v){
  //     var variant_aa_id = v.MUT_HGVS_AA
  //     $.ajax({
  //         url: document.location.protocol +"//"+ document.location.hostname + ':' + document.location.port + document.location.pathname + '/variantBoxAjax',
  //         type: 'GET',
  //         data : {
  //           'variant_aa_id': variant_aa_id
  //         },
  //         success: function(data) {
  //           // console.log(data)
  //           $('#' + variant_aa_id + '_cardbox').html(data);
  //         }
  //     });
  //   })
  // }


  jQuery.fn.d3Click = function () {
    this.each(function (i, e) {
      var evt = document.createEvent("MouseEvents");
      evt.initMouseEvent("click", true, true, window, 0, 0, 0, 0, 0, false, false, false, false, 0, null);

      e.dispatchEvent(evt);
    });
  };


})
