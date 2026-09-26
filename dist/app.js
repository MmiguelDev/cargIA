const screens=[...document.querySelectorAll('[data-screen]')];
function goTo(name){
  screens.forEach(screen=>screen.classList.toggle('is-active',screen.dataset.screen===name));
  window.scrollTo({top:0,behavior:'smooth'});
}
document.addEventListener('click',event=>{
  const example=event.target.closest('[data-example]');
  if(example){
    const textarea=document.querySelector('#shipment-request');
    textarea.value=example.dataset.example;
    document.querySelector('#char-count').textContent=textarea.value.length;
    textarea.focus();
  }
  const target=event.target.closest('[data-go]');
  if(!target)return;
  event.preventDefault();
  goTo(target.dataset.go);
});
document.querySelector('#shipment-request')?.addEventListener('input',event=>{
  document.querySelector('#char-count').textContent=event.target.value.length;
});
document.addEventListener('click',event=>{
  if(event.target.closest('[data-print]'))window.print();
});

function registerAgentTools(){
  const context=document.modelContext;
  if(!context?.registerTool)return;
  const register=tool=>Promise.resolve(context.registerTool(tool)).catch(()=>{});
  register({
    name:'start_shipment_request',
    title:'Iniciar solicitud de carga',
    description:'Abre el formulario de nueva carga y coloca una descripción logística para que el usuario pueda revisarla.',
    inputSchema:{type:'object',properties:{description:{type:'string',minLength:10,maxLength:500}},required:['description'],additionalProperties:false},
    annotations:{readOnlyHint:false,untrustedContentHint:false},
    execute(input){
      if(!input||typeof input.description!=='string'||input.description.trim().length<10||input.description.length>500)throw new Error('La descripción debe tener entre 10 y 500 caracteres.');
      const textarea=document.querySelector('#shipment-request');
      textarea.value=input.description.trim();
      document.querySelector('#char-count').textContent=textarea.value.length;
      goTo('create');
      return {screen:'create',description:textarea.value};
    }
  });
  register({
    name:'select_demo_transport_offer',
    title:'Seleccionar propuesta de transporte',
    description:'Selecciona la propuesta disponible de Transportes MX y muestra el viaje confirmado.',
    inputSchema:{type:'object',properties:{offerId:{type:'string',enum:['transportes-mx']}},required:['offerId'],additionalProperties:false},
    annotations:{readOnlyHint:false,untrustedContentHint:false},
    execute(input){
      if(input?.offerId!=='transportes-mx')throw new Error('La propuesta indicada no está disponible.');
      goTo('confirmed');
      return {screen:'confirmed',tripId:'CM-026-1048',carrier:'Transportes MX',status:'CONFIRMADO'};
    }
  });
}
registerAgentTools();
