import { Component, Input, OnInit, AfterContentInit, OnDestroy  } from '@angular/core';
import { FormArray, FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { async, Subscription } from 'rxjs';
import { AcceuilMissionList, IMission } from '../Imission';
import { ProgrammerService } from '../programmer/programmer.service';
import { IchauffeursVehicule, Iclients, Idepenses, Iproduits, Itrajets } from '../programmer/iprogrammer';
import { SdetailMissionService } from './sdetail-mission.service';

  // const toSelect = this.patientCategories.find(c => c.id == 3);
  // this.patientCategory.get('patientCategory').setValue(toSelect);
  // <child-selector (bookTitleCreated)=onBookAdded($event)></child-selector>


@Component({
  selector: 'app-detail-mission',
  templateUrl: './detail-mission.component.html',
  styleUrls: ['./detail-mission.component.css']
})
export class DetailMissionComponent implements OnInit,  AfterContentInit, OnDestroy {

  @Input() Mission!: AcceuilMissionList  ;
  @Input() exercice_id!:number;

  sub!:Subscription

  // recuperation de la mission a voir le detail
  constructor(
    private route: ActivatedRoute,
    private fb:FormBuilder,
    private programmerService:ProgrammerService) {}

    formMission = this.fb.group({

      infoMission:this.fb.group({
        date_mission:['', {validators:[Validators.required]}],
        motif:['', {validators:[Validators.required]}],
        chauffeur:['', {validators:[Validators.required]}],
        trajet_concerne:['', {validators:[Validators.required]}],
        choix_mode_evaluation:['',
            {validators:[Validators.required]}
            // boolean si false: recette Sans Pesage
            // boolean si true: recette avec Pesage
        ]
      }),

      infoPoids:this.fb.group({
        premier_poids:[''],
        deuxieme_poids:[''],
      }),

      liste_depenses:this.fb.array([]),
      liste_produits:this.fb.array([]),
    })

    listeChauffeurs :IchauffeursVehicule [] = [];

    motifs_mission:any[]=['Approvissionnement', 'Livraision'];
    listeTrajets!:Itrajets[];
    listeClients:Iclients[]=[];
    listesProduits:Iproduits[] = [];
    listesDepenses:Idepenses[] = [];

  ngOnInit(): void {
     this.getListesChauffeurVehicules();
  }

  // New SECTION --> Insertion des donnees la mission a modifier dans le formulaire
  ngAfterContentInit(): void {
       // insertion de la motif mission, de la date de mission
       this.missionSelectionDate = this.Mission.date_mission
       this.motifMissionSlectionnee = this.Mission.motif
       this.modeEvalutionMissionChoisie = (this.Mission.produits.length<0)

       // insertion des depenses et produits de la mission a editer dans le template
       this.AjoutListeDepenseMission_toUpdate();
       this.AjoutListeProduitsMission_toUpdate();
  }

  missionConcerneeParEdition!:any;
  missionSelectionDate!:Date; // date de la mission selectionner
  motifMissionSlectionnee!:string;
  modeEvalutionMissionChoisie!:boolean;

  compareTrajetFn(c1: any, c2: AcceuilMissionList) {
    return  c2.trajet.id === c1 ;
  }

  compareChauffeurFn(c1:any, c2:AcceuilMissionList){
    return c2.vehicule.id === c1;
  }

  AjoutListeDepenseMission_toUpdate(){
    this.Mission.depenses.forEach(element=> {
        this.depensesFieldAsFormArray.push(
          this.depenseControleur(element.intitule_depense__intitule,element.montant));

    })
  }

  AjoutListeProduitsMission_toUpdate(){
    this.Mission.produits.forEach(element=>{
      this.produitsFieldAsFormArray.push(
        this.produitsControleur(element.produit__nom,element.qte_produit, 0));
    })
  }

/* generation automatique des champs de saisie*/

    //Pour depenses
  depenseSelectionnes = new FormControl(''); // controle de recuperation des depenses

  // nombre de depenses selectionner
  get nombreDepenses():any{
    const depenseSelection:any= this.depenseSelectionnes.value
    if(depenseSelection?.length!=0){
      return depenseSelection?.length
    }
    return 0
  }

  onSelectionDepenseTeminer(){
    this.AjouterDepenseField();
   // pour desactiver le champs intitule de la depense selectionne
   const fg = this.formMission.get('liste_depenses') as FormArray // recuperation du tabl formarray de depenses

   //   Probleme à resourdre
   fg.controls.forEach(control=>{ // parcours de chaque formGroup
         control.get('intitule')?.disable() // recuperation du champs nom et desactivation
         // ajout de quelques validateurs
         control.get('montant')?.setValidators(Validators.required)
   });

   }

  get depensesFieldAsFormArray():any{
    //methode d'obtention au champs dans le form comme un FormArray
    return this.formMission.get('liste_depenses') as FormArray
  }

  depenseControleur(intitule:string, quantite:number):any{
    // creation du nouveau controleur à ajouter automatiquement dans le FormArray
    return this.fb.group({
      depense:this.fb.control(intitule),
      intitule : [intitule, {validators:[Validators.required]}],
      montant: [quantite, {validators:[Validators.required]}],
    })}

  AjouterDepenseField():void{
    // ajout du champ au formulaire
    const depensesSelectionne:any= this.depenseSelectionnes.value

    if(depensesSelectionne?.length!=0){
      depensesSelectionne.forEach((element:any) => {
        this.depensesFieldAsFormArray.push(this.depenseControleur(element,0));
        this.depenseSelectionnes.reset()
        });

        this.depenseSelectionnes = new FormControl()
    }


  }

  supprimerDepenseField(i:number):void{
    // suppression du champs du fromulaire
    this.depensesFieldAsFormArray.removeAt(i)
  }

  //Pour Produit
  produitSelectionnes = new FormControl(''); //

  // ecouter apres chaque selection de produit
  onSelectionTeminer(){
   this.AjouterProduitField();

   // pour desactiver le champs nom du produit selectionne
   const fg = this.formMission.get('liste_produits') as FormArray // recuperation du tabl formarray de produit

   // Probleme à resoudre
    fg.controls.forEach(control=>{ // parcours de chaque formGroup
          control.get('nom')?.disable() // recuperation du champs nom et desactivation
          // ajout de quelque validateurs
          control.get('quantite')?.setValidators(Validators.required)
          control.get('cout_unitaire')?.setValidators(Validators.required)
          control.get('client')?.setValidators(Validators.required)
    })
  }

  get produitsFieldAsFormArray():any{
    //methode d'obtention au champs dans le form comme un FormArray
    return this.formMission.get('liste_produits') as FormArray
  }

  produitsControleur(nom:string, quantite:number, cout_unitaire:number):any{
    // creation du nouveau controleur à ajouter automatiquement dans le FormArray

    return this.fb.group({
      produit:this.fb.control(nom),
      nom : this.fb.control(nom),
      quantite:[quantite, [Validators.required]],
      cout_unitaire:[cout_unitaire, [Validators.required]],
      client:['', [Validators.required]]
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

    console.log(this.produitSelectionnes)
    if(produitSelectionne?.length!=0){
      produitSelectionne.forEach((element:any) => {
        this.produitsFieldAsFormArray.push(this.produitsControleur(element,0, 0));
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

// ecoute du type de recette à enregistrer
change_mode_evaluation(){
  const choix:any = this.formMission.get('infoMission')?.get('choix_mode_evaluation')?.value
  this.choix_mode_evaluation = choix;

  // ajout de validateurs lors de l'enregistrement des pesees
  if(choix == true){
    this.formMission.get('infoPoids')?.get('premier_poids')?.setValidators(Validators.required)
    this.formMission.get('infoPoids')?.get('deuxieme_poids')?.setValidators(Validators.required)
  }
  else{
    this.formMission.get('infoPoids')?.reset()
  }

  /*
    this.choix_mode_evaluation = this.formMission.get('infoMission')?.get('choix_mode_evaluation')?.value
      error: pas d'affection de undefine a un boolean
    */
  }

/* inter-action avec la bd*/

// SECTION GET : trajet, chauffeur, produit , depense, client
                // trajet = {id, ville_depart, ville_arrivee, intitule }
                // chauffeur = { idvehicule, nom, prenom }
                // produit = { id, nom, unite }
                // depense = { id, intitule }
                // client = { id, nom, prenom  }

    getListeIntituleTrajets():void{
        this.programmerService.getListeIntituleTrajets()
        .subscribe(
          (data:Itrajets[])=>{
            this.listeTrajets = data;
          },
          error=>{
            console.log(error)
          },
          ()=>{
            setTimeout(()=>{
              this.getListeIntituleProduits(); //implementation de l'anatomicite : transaction
            }, 2000)

          }
        )
    }
    getListeIntituleProduits():void{
        this.programmerService.getListeIntituleProduits()
        .subscribe(
          (data:Iproduits[])=>{
            this.listesProduits = data;
            console.log(this.listesProduits)
          },
          error=>{
            console.log(error)
          },
          ()=>{
            this.getListeIntituleDepenses(); //implementation de l'anatomicite : transaction
          }
        )
    }

    getListesChauffeurVehicules():void{
      this.programmerService.getListesChauffeurVehicules()
      .subscribe(
        (data:IchauffeursVehicule[])=>{
          this.listeChauffeurs= data;
        },
        error=>{
          console.log(error)
        },
        ()=>{
          this.getListeIntituleTrajets(); //implementation de l'anatomicite : transaction
        }
      )
    }

    getListeIntituleDepenses():void{
        this.programmerService.getListeIntituleDepenses()
        .subscribe(
          (data:Idepenses[])=>{
            this.listesDepenses= data;
          },
          error=>{
            console.log(error)
          },
          ()=>{
            this.getListeClients(); //implementation de l'anatomicite : transaction
          }
          )
    }

    getListeClients():void{
      this.programmerService.getListeClients()
        .subscribe(
          (data:Iclients[])=>{
            this.listeClients= data;
          },
          error=>{
            console.log(error)
          },
          ()=>{}
          )
    }

  // SECTION POST MISSION

    get isMissionFormulaireValide():boolean{
      return this.formMission.valid;
    }

  saveMission(){

      // construction de l'objet à envoyer
        const mission_instance:any = {
          exercice_conerne:Number(this.exercice_id),
          vehicule_concerne:Number(this.formMission.get('infoMission')?.get('chauffeur')?.value) ,
          trajet_concerne:Number(this.formMission.get('infoMission')?.get('trajet_concerne')?.value),
          liste_produits:this.formMission.get('liste_produits')?.value,
          liste_depenses:this.formMission.get('liste_depenses')?.value,
          date_mission:this.formMission.get('infoMission')?.get('date_mission')?.value,
          motif:this.formMission.get('infoMission')?.get('motif')?.value,
          infoPesage: this.formMission.get('infoPoids')?.value // envoie meme si il est sans pesage -->bd
        }

        const mission:IMission={
          exercice_conerne: Number(this.exercice_id),
          vehicule_concerne: Number(this.formMission.get('infoMission')?.get('chauffeur')?.value),
          trajet_concerne: Number(this.formMission.get('infoMission')?.get('trajet_concerne')?.value),
          motif: "Approvissionement" //this.formMission.get('infoMission')?.get('motif')?.value,
          ,
          etat_mission: false,

          date_mission: new Date()
        }
        // pour le moment
        if(this.isMissionFormulaireValide){
          //this.programmerService.saveMission(mission);
        }
    }
   //
  ngOnDestroy(): void {
      //this.sub.unsubscribe();
  }

}