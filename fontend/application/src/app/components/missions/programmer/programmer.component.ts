import { Component, OnInit } from '@angular/core';
import { FormArray, FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-programmer',
  templateUrl: './programmer.component.html',
  styleUrls: ['./programmer.component.css']
})
export class ProgrammerComponent implements OnInit {

  exercice_id!:number;
  constructor(
    private route: ActivatedRoute,
    private fb:FormBuilder
    ) { }

    formMission = this.fb.group({

      infoMission:this.fb.group({
        date_mission:['', {validators:[Validators.required]}],
        motif:['', {validators:[Validators.required]}],
        chauffeur:['', {validators:[Validators.required]}],
        trajet_concerne:['', {validators:[Validators.required]}],
        choix_mode_evaluation:['', {validators:[Validators.required]}]
      }),

      infoPoids:this.fb.group({
        premier_poids:['',{validators:[Validators.required]}],
        deuxieme_poids:['',{validators:[Validators.required]}],
      }),

      liste_depenses:this.fb.array([]),
      liste_produits:this.fb.array([]),
    })

    listeChauffeurs :any [] = ['Ous Issa ', 'Ouedraogo Amado', 'Ouedraogo Moussa']
    motifs_mission:any[]=['Approvissionnement', 'Livraision']
    listeTrajets:any[]=['Bobo-Ouaga', 'Ouaga-Abidjan', 'Bobo-Abidjan']

    toppings = new FormControl('');
    toppingList: string[] = ['Extra cheese', 'Mushroom', 'Onion', 'Pepperoni', 'Sausage', 'Tomato'];



  ngOnInit(): void {
    this.exercice_id = this.exercice_parent();
  }

  exercice_parent():number{
    // methode permettant de retourner l'exercice parent d'une mission
    let queryParam:any;

       this.route.queryParamMap  //Recuperation des parametres state d'url : ActivatedRoute
      .subscribe((params) => {
         queryParam = {...params }; // operateur de diffussion

       });
       return queryParam.params.exercice
  }

/* generation automatique des champs de saisie*/

    //Pour depenses
  listesDepenses:any[] = [
    {intitule:'frais de carburant'}, {intitule:'Carburant'},
    {intitule:'frais de douane'}
    ];
  depenseSelectionnes = new FormControl('');

  onSelectionDepenseTeminer(){
    this.AjouterDepenseField();
   }

  get depensesFieldAsFormArray():any{
    //methode d'obtention au champs dans le form comme un FormArray
    return this.formMission.get('liste_depenses') as FormArray
  }

  depenseControleur():any{
    // creation du nouveau controleur à ajouter automatiquement dans le FormArray
    return this.fb.group({
      intitule : ['', {validators:[Validators.required]}],
      cout_unitaire: ['', {validators:[Validators.required]}],
    })}

  AjouterDepenseField():void{
    // ajout du champ au formulaire
    const depensesSelectionne:any= this.depenseSelectionnes.value
    if(depensesSelectionne?.length!=0){
      depensesSelectionne.forEach((element:any) => {

        this.depensesFieldAsFormArray.push(this.depenseControleur());
        this.depenseSelectionnes.reset()
        });
    }

  }

  supprimerDepenseField(i:number):void{
    // suppression du champs du fromulaire
    this.depensesFieldAsFormArray.removeAt(i)
  }

  //Pour Produit
  listesProduits:any[] = [
    {name:'fer', unite:'tonne'},
    {name:'bois', unite:'tonne'},
    {name:'clinker', unite:'tonne'}
  ]

  produitSelectionnes = new FormControl('');

  onSelectionTeminer(){
   this.AjouterProduitField();
  }

  get produitsFieldAsFormArray():any{
    //methode d'obtention au champs dans le form comme un FormArray
    return this.formMission.get('liste_produits') as FormArray
  }

  produitsControleur(nom="", quantite=0, cout_unitaire=0):any{
    // creation du nouveau controleur à ajouter automatiquement dans le FormArray
    return this.fb.group({
      nom : [nom, [Validators.required]],
      quantite:[quantite, [Validators.required]],
      cout_unitaire:[cout_unitaire, [Validators.required]]
    })
  }

  get nombreProduit():any{
    const produitSelectionne:any= this.produitSelectionnes.value
    if(produitSelectionne?.length!=0){
      return produitSelectionne?.length
    }
    return 0
  }

  AjouterProduitField():void{
    // ajout du champ au formulaire
    const produitSelectionne:any= this.produitSelectionnes.value

    if(produitSelectionne?.length!=0){
      produitSelectionne.forEach((element:any) => {
        this.produitsFieldAsFormArray.push(this.produitsControleur());
        this.produitSelectionnes.reset()
        });
    }
  }

  supprimerProduitField(i:number):void{
    // suppression du champs du fromulaire
    this.produitsFieldAsFormArray.removeAt(i)
  }

// section evaluation des recettes
  choix_mode_evaluation:boolean = false // boolean d'ecoute du mode choisie

  change_mode_evaluation(){
    const choix:any = this.formMission.get('infoMission')?.get('choix_mode_evaluation')?.value
    this.choix_mode_evaluation = choix
    /*
      this.choix_mode_evaluation = this.formMission.get('infoMission')?.get('choix_mode_evaluation')?.value
      error: pas d'affection de undefine a un boolean
    */
  }



}