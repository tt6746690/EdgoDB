var genes = new Bloodhound({
  datumTokenizer: Bloodhound.tokenizers.obj.,
  queryTokenizer: Bloodhound.tokenizers.whitespace,
  local: ['a2m', 'pi3k']
  // prefetch: '../data/nba.json'
});

// var nhlTeams = new Bloodhound({
//   datumTokenizer: Bloodhound.tokenizers.obj.whitespace('team'),
//   queryTokenizer: Bloodhound.tokenizers.whitespace,
//   prefetch: '../data/nhl.json'
// });

$('#multiple-datasets .typeahead').typeahead({
    highlight: true
  },
  {
    name: 'genes',
    source: genes,
  }
  // {
  //   name: 'nhl-teams',
  //   display: 'team',
  //   source: nhlTeams,
  //   templates: {
  //     header: '<h3 class="league-name">NHL Teams</h3>'
  //   }
});
