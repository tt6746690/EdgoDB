I put the PDB files and descriptions for the provided mutations in the following folder: http://kimweb1.ccbr.utoronto.ca/library/taipale/.

The folder contains three files: mutation_info.tsv, failed_info.tsv, and structures.7z.

The mutation_info.tsv file contains information for the 1942 mutations for which we could calculate a homology model. It has the following columns:

mutation_refseq_nt : Mutation_RefSeq_NT column from the provided excel file.
mutation_refseq_aa : Mutation_RefSeq_AA column from the provided excel file.
uniparc_id : UniParc protein ID used as an intermediary when mapping from RefSeq to UniProt.
uniprot_id : UniProt ID used by ELASPIC.
uniprot_mutation : Mutation mapped to the UniProt sequence.
chain_modeller : Mutated chain in the Modeller PDB file.
mutation_modeller : Mutated residue (RESNUM) in the Modeller PDB file.
norm_dope : Normalised DOPE score provided by Modeller.
provean_score : Provean score for the particular mutation.
elaspic_ddg : ELASPIC prediction for the particular mutation.
elaspic_url : ELASPIC URL for the particular mutation.
modeller_pdb : path and name of the modeller PDB file (inside the structures.7z archive).
foldx_pdb_wt : path and name of the FoldX wild-type PDB file (inside the structures.7z archive).
foldx_pdb_mut : path and name of the FoldX mutant PDB file (inside the structures.7z archive).
Since ELASPIC relies on UniProt protein identifiers, we had to map RefSeq proteins in your file to UniProt proteins before creating the homology models.

Also, please note that the DOPE score for some of the models is very high. DOPE score is an “energy score” that Modeller uses to assess the quality of the models. Scores < -1 are best, and models with a DOPE score > 1 are questionable.

The failed_info.tsv file lists the reasons why we could not calculate homology models for the remainder of the mutations. In many cases, this was because the mutated protein had no structural domains or the mutation fell outside the structural domains. Some mutations are mis-sense, and so a ΔΔG score is not applicable…

The structures.7z file is a 7zip archive containing Modeller and FoldX crystal structures. You should look at the modeller_pdb, foldx_pdb_wt, and foldx_pdb_mut fields in the mutation_info.tsv file in order to find the location of each model.

I created an ELASPIC results page for the “Taipale” mutations, which can be accessed here: http://elaspic.kimlab.org/result/taipale/. The page loads very slowly at the moment, but this can be optimised if necessary. You can navigate to a particular mutation by appending {uniprot_id}.{uniprot_mutation}/ to the link, e.g.: http://elaspic.kimlab.org/result/taipale/P62736.N117T/.

Somewhat surprisingly, many of the mutations are predicted to fall inside protein-protein interfaces. I did not check the validity of those predictions, but it might be something worth investigating.

The source code for the ELASPIC webserver is hosted on github: https://github.com/ostrokach/elaspic-webserver. The repository is private; in order for me to grant you read access, I need you to email me your github username.

Hope this helps, and please email me if some information is missing or you have any questions,
