export const CONSEQUENCES = [
  { id:"health-long-term", text:"Avoir des problèmes de santé à long terme.", category:"health", short:"Problèmes de santé à long terme" },
  { id:"anxiety", text:"Ressentir beaucoup d’anxiété.", category:"health", short:"Anxiété" },
  { id:"depression", text:"Traverser une dépression.", category:"health", short:"Dépression" },
  { id:"addiction", text:"Devenir dépendant d’un produit.", category:"health", short:"Dépendance" },
  { id:"training-ban", text:"Ne plus avoir le droit de s’entraîner ou de participer pendant un certain temps.", category:"sport", short:"Interdiction temporaire de s’entraîner ou de participer" },
  { id:"cancelled", text:"Perdre les résultats obtenus.", category:"sport", short:"Perte des résultats" },
  { id:"selection", text:"Perdre une médaille, une sélection ou une compétition importante.", category:"sport", short:"Médaille, sélection ou compétition perdue" },
  { id:"career", text:"Voir sa carrière sportive fragilisée ou potentiellement interrompue.", category:"sport", short:"Carrière fragilisée ou potentiellement interrompue" },
  { id:"money", text:"Perdre de l’argent, une aide ou des revenus.", category:"social", short:"Perte d’argent, d’aides ou de revenus" },
  { id:"sponsors", text:"Perdre un sponsor ou un partenaire.", category:"social", short:"Perte de sponsors ou de partenaires" },
  { id:"friends", text:"Perdre la confiance ou le soutien de certaines personnes, y compris des amis.", category:"social", short:"Perte de confiance, de soutien ou d’amis" },
  { id:"isolation", text:"Se sentir isolé, honteux ou coupable.", category:"social", short:"Isolement, honte ou culpabilité" },
  { id:"always-win", text:"Être certain de gagner toutes ses compétitions.", category:null },
  { id:"better", text:"Devenir automatiquement un meilleur sportif.", category:null },
  { id:"hidden-safe", text:"Ne rien risquer lorsque personne ne découvre le dopage.", category:null },
  { id:"advised", text:"Ne pas être responsable si un produit a été conseillé par quelqu’un d’autre.", category:null }
];

export const CATEGORIES = [
  { id:"health", title:"Sur la santé" },
  { id:"sport", title:"Sur la vie sportive" },
  { id:"social", title:"Sur la vie sociale ou professionnelle" }
];

export const FALSE_IDEAS = "Le dopage ne garantit jamais de gagner ou de devenir un meilleur sportif. Il peut avoir des conséquences même s’il n’est pas immédiatement découvert. Un sportif doit aussi vérifier les produits qui lui sont conseillés.";
export const FINAL_MESSAGE = "Le dopage peut avoir des conséquences sur la santé, la vie sportive, les relations et la vie professionnelle. Il peut également toucher la famille, l’équipe et le club du sportif. Toutes ces conséquences ne sont pas automatiques, mais elles peuvent être graves et durer longtemps.";
export function shuffle(items){const copy=[...items];for(let i=copy.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[copy[i],copy[j]]=[copy[j],copy[i]]}return copy}
