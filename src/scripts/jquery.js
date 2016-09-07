
$(document).ready(function(){

  // scrollspy behaviour
  $("body").scrollspy({
      target: "#target_nav",
      offset: 50
  })


  // tooltip handling
  $('[data-toggle="tooltip"]').tooltip()

  $('#showToolTip').click(function(){
    $('.showToolTip').tooltip('toggle')
  })


  // data table

  if(document.getElementById('#variantTable')){
    $('#variantTable').DataTable()
  }


  // pv viewer handling
  if(typeof window.pv !== 'undefined' && window.pdbInfo.length !== 0){
    var viewer = pv.Viewer(document.getElementById('pv'), {
      width: 536,
      height: 460,
      antialias: true,
      quality : 'high',
      style: "hemilight"
    })
    pv.io.fetchPdb('http://files.rcsb.org/download/' + pdbInfo[0].PDB_ID + '.pdb', function(structure){
          viewer.cartoon('protein', structure, { color : color.ssSuccession()});
          viewer.centerOn(structure);
    });

  }

  $('a.pdb-ajax-link').click(function(e){
    e.preventDefault()
    pv.io.fetchPdb('http://files.rcsb.org/download/' + $(this).attr("id") + '.pdb', function(structure){
          viewer.cartoon('protein', structure, { color : color.ssSuccession()});
          viewer.centerOn(structure);
    });
  })



  // damn definitely use REACT/REDUX for this later. STATE!!!
  // variant.forEach(function(v){
  //   $('.nav-tabs a[href="#' + v.MUT_HGVS_AA + '_cardbox"]').click(function() {
  //     $('#' + v.MUT_HGVS_AA + '_needleHead').d3Click();
  //   });
  // })


  // custom function to transfer click event handling from d3 to jquery
  jQuery.fn.d3Click = function () {
    this.each(function (i, e) {
      var evt = document.createEvent("MouseEvents");
      evt.initMouseEvent("click", true, true, window, 0, 0, 0, 0, 0, false, false, false, false, 0, null);

      e.dispatchEvent(evt);
    });
  };


  // // not using ajax. bad practice
  // if (typeof window.pv !== 'undefined' && window.pdbInfo.length !== 0){
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

})
