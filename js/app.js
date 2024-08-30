let cliente = {
    mesa: '',
    hora: '',
    pedido: []
};

const categorias = {
    1: 'Comida',
    2: 'Bebidas',
    3: 'Postres'
}

const btnGuardaCliente = document.querySelector('#guardar-cliente');
btnGuardaCliente.addEventListener('click', guardarCliente);

function guardarCliente() {
    const mesa = document.querySelector('#mesa').value;
    const hora = document.querySelector('#hora').value;

    //Revisar si hay campos vacios
    const camposVacios = [mesa, hora].some(campo => campo === '');

    if (camposVacios) {
        //Verificar si ya hay una alerta
        const existeAlerta = document.querySelector('.invalid-feedback');
        if (!existeAlerta) {
            const alerta = document.createElement('DIV');
            alerta.classList.add('invalid-feedback', 'd-block', 'text-center');
            alerta.textContent = 'Todos los campos son obligatorios';
            document.querySelector('.modal-body form').appendChild(alerta);

            //Eliminar alerta
            setTimeout(() => {
                alerta.remove();
            }, 3000);
            
        }

        return;
    }

    // Esto es un spread operator, va a tomar una copa de cliente yluego le va a, asignar los valores del formulario
    cliente = {...cliente, mesa, hora};

    // Ocultar Modal
    const modalFormulario = document.querySelector('#formulario');
    const modalBootstrap = bootstrap.Modal.getInstance(modalFormulario);
    modalBootstrap.hide();

    // Mostrar las selecciones
    mostrarSecciones(); 
    
    //Opbener platillos de la API de JSON-SERVER
    obtenerPlatillos();



}

function mostrarSecciones() {
        const seccionesOcultas = document.querySelectorAll('.d-none');
        seccionesOcultas.forEach(seccion => seccion.classList.remove('d-none'));
}

function obtenerPlatillos() {
    const url = 'http://localhost:3000/platillos';
    fetch(url)
        .then(respuesta => respuesta.json())
        .then(resultado => mostrarPlatillos(resultado))
        .catch(error => console.log(error))
}

function mostrarPlatillos(platillos) {
    const contenido = document.querySelector('#platillos .contenido');

    platillos.forEach(platillo => {
        const row = document.createElement('DIV');
        row.classList.add('row', 'py-3',);

        const nombre = document.createElement('DIV');
        nombre.classList.add('col-md-4');
        nombre.textContent = platillo.nombre;

        const precio = document.createElement('DIV');
        precio.classList.add('col-md-3', 'fw-bold');
        precio.textContent = `$${platillo.precio}`;
        
        const categoria = document.createElement('DIV');
        categoria.classList.add('col-md-3');
        // Usamos los corchetes porque categorias es un objeto con las keys que corresponden al los elementos de la categoria, los corchetes son para poner las key, en este caso 1 2 y 3 y nos llamara sus respectivos elementos 
        categoria.textContent = categorias[platillo.categoria];

        const inputCantidad = document.createElement('input');
        inputCantidad.type = 'number';
        inputCantidad.min = 0;
        inputCantidad.value = 0;
        inputCantidad.id = `producto-${platillo.id}`
        inputCantidad.classList.add('form-control');

        //Funcion que detecta la cantidad y el paltillo que se esta agregando
        //Para los eventos de "onchange" "onclick" etc, si la funcion no tiene parametros no es necesario ponerle el () alas funciones
        inputCantidad.onchange = (() => {
            const cantidad = parseInt(inputCantidad.value);
            agregaPlatillo({...platillo,cantidad});
        });


        const agregar = document.createElement('DIV');
        agregar.classList.add('col-md-2');
        agregar.appendChild(inputCantidad)


        row.appendChild(nombre);
        row.appendChild(precio);
        row.appendChild(categoria);
        row.appendChild(agregar);;
        contenido.appendChild(row);
    })
}

function agregaPlatillo(producto) {
    //Extraer el pedido actual
    let { pedido } = cliente;

    //Revisar que la cntidad sea mayor a 0
    if (producto.cantidad > 0) {
        //Podemos utilizar .some porque es un array method y nos devuelve un true
        //Es decir que podemos usar .some para verificar si un objeto ya esta en un array
        if (pedido.some(articulo => articulo.id === producto.id)) {
            //El articulo ya existe, actualizar la cantidad

            const pedidoActualizado = pedido.map(articulo => {
                if (articulo.id === producto.id) {
                    articulo.cantidad = producto.cantidad;
                }
                return articulo;
            });
            //Se asigna el nuevo Array a cliente . pedido
            cliente.pedido = [...pedidoActualizado];

        } else {
            //Si el articulo no existe loa gregamos al array de pedido
            cliente.pedido = [...pedido, producto];

        }
        
    } else {
        //Eliminar elementos cuando la cantidad es 0
        //Con filter va a crear una copia del array pedido que sea distinto validandolo por el id  
        const resultado = pedido.filter(articulo => articulo.id !== producto.id);

        cliente.pedido = [...resultado];

    }
    //Limpiar el HTML PREVIO
    limpiarHTML();

    //Siempre llamamo cliente.pedido, porque es despues de las declaciones de la variable, entonces asi nos aseguramos de que es la ultima version la que estamos llamando
    if (cliente.pedido.length) {
        //Mostrar el resumen
        actualizarResumen();
    } else {
        mensajePedidoVacio();
    }

    

    
}

function actualizarResumen() {
    const contenido = document.querySelector('#resumen .contenido');

    const resumen = document.createElement('DIV');
    resumen.classList.add('col-md-6', 'card', 'py-2', 'px-3', 'shadow', 'mt-4', );

    //INFORMACION DE LA MESA
    const mesa = document.createElement('p');
    mesa.textContent = 'Mesa: ';
    mesa.classList.add('fw-bold');

    const mesaSpan = document.createElement('SPAN');
    mesaSpan.textContent = cliente.mesa
    mesaSpan.classList.add('fw-normal');

    //INFORMACION DE LA HORA
    const hora = document.createElement('p');
    hora.textContent = 'Hora: ';
    hora.classList.add('fw-bold');

    const horaSpan = document.createElement('SPAN');
    horaSpan.textContent = cliente.hora
    horaSpan.classList.add('fw-normal');

    mesa.appendChild(mesaSpan);
    hora.appendChild(horaSpan);

    //Titulo de la seccion
    const heading = document.createElement('H3');
    heading.textContent = 'Platillos Consumidos'
    heading.classList.add('my-4', 'text-center')

    //Iterar sobre el array de pedidos

    const grupo = document.createElement('UL');
    grupo.classList.add('list-group');

    const { pedido } = cliente;

    pedido.forEach(articulo => {
        const { nombre, cantidad, precio, id = articulo } = articulo;

        const lista = document.createElement('LI');
        lista.classList.add('list-group-item');

        const nombreEl = document.createElement('H4');
        nombreEl.classList.add('my-4');
        nombreEl.textContent = nombre;

        //Cantidad del articulo
        const cantidadEl = document.createElement('P');
        cantidadEl.classList.add('fw-bold');
        cantidadEl.textContent = 'Cantidad: ';

        const cantidadValor = document.createElement('SPAN');
        cantidadValor.classList.add('fw-normal');
        cantidadValor.textContent = cantidad;

        const precioEl = document.createElement('P');
        precioEl.classList.add('fw-bold');
        precioEl.textContent = 'Precio: ';

        const precioValor = document.createElement('SPAN');
        precioValor.classList.add('fw-normal');
        precioValor.textContent = `$ ${precio}`;

    
        //Subtotal del articuloi
        const subtotalEl = document.createElement('P');
        subtotalEl.classList.add('fw-bold');
        subtotalEl.textContent = 'Subtotal: ';

        const subtotalValor = document.createElement('SPAN');
        subtotalValor.classList.add('fw-normal');
        subtotalValor.textContent = calcularSubtotal(precio, cantidad);
        
        // Boton para eliminar
        const btnEliminar = document.createElement('BUTTON');
        btnEliminar.classList.add('btn', 'btn-danger');
        btnEliminar.textContent = 'Eliminar Pedido'

        //Funcion para eliminar pedido
        btnEliminar.onclick = function () {
            eliminarProducto(id);
        }

        

        // Agregar Valores a sus contenedores
        cantidadEl.appendChild(cantidadValor);
        precioEl.appendChild(precioValor);
        subtotalEl.appendChild(subtotalValor);

        //Agregar Elementos al LI 
        lista.appendChild(nombreEl);
        lista.appendChild(cantidadEl);
        lista.appendChild(precioEl);
        lista.appendChild(subtotalEl);
        lista.appendChild(btnEliminar);

        //Agregar lista al grupo principal
        grupo.appendChild(lista);

    })
    resumen.appendChild(heading);

    resumen.appendChild(mesa);
    resumen.appendChild(hora);
    resumen.appendChild(grupo);

    contenido.appendChild(resumen);

    //Mostrar Formulario de propidas
    formularioPropinas();
}

function limpiarHTML() {
    const contenido = document.querySelector('#resumen .contenido');

    while (contenido.firstChild) {
        contenido.removeChild(contenido.firstChild);
    }
}

function calcularSubtotal(precio, cantidad) {
    return `$ ${precio * cantidad}`;
}

function eliminarProducto(id) {
    const { pedido } = cliente;
    const resultado = pedido.filter(articulo => articulo.id !== id);
    cliente.pedido = [...resultado];

    //Limpiar el HTML PREVIO
    limpiarHTML();
    

    if (cliente.pedido.length) {
        //Mostrar el resumen
        actualizarResumen();
    } else {
        mensajePedidoVacio();
    }

    //El producto se elimió por lo tanto regresamos la cantidad a 0 en el formulario
    const productoEliminado = `#producto-${id}`
    const inputEliminado = document.querySelector(productoEliminado);

    console.log(inputEliminado.value)

    inputEliminado.value = 0;
    console.log(inputEliminado.value)
}

function mensajePedidoVacio() {
    const contenido = document.querySelector('#resumen .contenido');

    const texto = document.createElement('P');
    texto.classList.add('text-center');
    texto.textContent = 'Añade los elementos del pedido'
    
    contenido.appendChild(texto);

    resumen.appendChild(contenido);

    console.log(contenido);

}

function formularioPropinas() {
    const contenido = document.querySelector('#resumen .contenido');

    const formulario = document.createElement('DIV');
    formulario.classList.add('col-md-6', 'formulario', 'pt-3'  );
    
    const divFormulario = document.createElement('DIV');
    divFormulario.classList.add('card','py-2', 'px-3', 'shadow','mt-2')


    const heading = document.createElement('H3');
    heading.classList.add('my-4', 'text-center');
    heading.textContent = 'Propina';

    // RECORDAR QUE RADIO BUTTON ES QUE DE UNA SERIE DE BOTONES NOS DEJA ELEJIR SOLAMENTE UNO
    // Radio Button  10%
    const radio10 = document.createElement('INPUT');
    radio10.type = 'radio';
    //Se le ponen .name iguales para poder elegir uno a la vez
    radio10.name = 'propina';
    radio10.value = '10';
    radio10.classList.add('form-check-input');
    radio10.onclick=clacularPropinas;

    const radio10Label = document.createElement('LABEL');
    radio10Label.textContent = '10%';
    radio10Label.classList.add('form-check-label');

    const radio10Div = document.createElement('DIV');
    radio10Div.classList.add('form-check');

    radio10Div.appendChild(radio10);
    radio10Div.appendChild(radio10Label);

    // Radio Button  25%
    const radio25 = document.createElement('INPUT');
    radio25.type = 'radio';
    //Se le ponen .name iguales para poder elegir uno a la vez
    radio25.name = 'propina';
    radio25.value = '25';
    radio25.classList.add('form-check-input');
    radio25.onclick=clacularPropinas;


    const radio25Label = document.createElement('LABEL');
    radio25Label.textContent = '25%';
    radio25Label.classList.add('form-check-label');

    const radio25Div = document.createElement('DIV');
    radio25Div.classList.add('form-check');

    radio25Div.appendChild(radio25);
    radio25Div.appendChild(radio25Label);

    // Radio Button  50%
    const radio50 = document.createElement('INPUT');
    radio50.type = 'radio';
    //Se le ponen .name iguales para poder elegir uno a la vez
    radio50.name = 'propina';
    radio50.value = '50';
    radio50.classList.add('form-check-input');
    radio50.onclick=clacularPropinas;


    const radio50Label = document.createElement('LABEL');
    radio50Label.textContent = '50%';
    radio50Label.classList.add('form-check-label');

    const radio50Div = document.createElement('DIV');
    radio50Div.classList.add('form-check');

    radio50Div.appendChild(radio50);
    radio50Div.appendChild(radio50Label);

    //Agregar al DIV PRINCIPAL
    divFormulario.appendChild(heading);
    divFormulario.appendChild(radio10Div);
    divFormulario.appendChild(radio25Div);
    divFormulario.appendChild(radio50Div);

    //Agregar al FORMULARIO
    formulario.appendChild(divFormulario);
    contenido.appendChild(formulario);
}
    
function clacularPropinas() {
    
    const { pedido } = cliente;
    let subtotal = 0;

    //Calcular el Subtotal a Pagar
    pedido.forEach(articulo => {
        subtotal += articulo.cantidad * articulo.precio;

    })

    //De esta manera podemos extraer el elemento que contenga esos atributos especificos en un HTML ya que es un radio siempre sera un valor unico
    const propinaSeleccionada = document.querySelector('[name="propina"]:checked').value;

    //Calcular la propina
    const propina = (parseInt(propinaSeleccionada) / 100) * subtotal;

    console.log(propina);

    //Calcular el total

    const total = subtotal + propina;

    mostrarTotalHTML(subtotal, total, propina);
}

function mostrarTotalHTML(subtotal,total,propina) {
    
    const divTotales = document.createElement('DIV');
    divTotales.classList.add('total-pagar', 'my-3')

    //SubTotal
    const subtotalParrafo = document.createElement('p');
    subtotalParrafo.classList.add('fs-4', 'fw-bold', 'mt-5');
    subtotalParrafo.textContent = `Subtotal Consumo: `;

    const subtotalSpan = document.createElement('SPAN');
    subtotalSpan.classList.add('fw-normal');
    subtotalSpan.textContent = `$${subtotal}`;

    subtotalParrafo.appendChild(subtotalSpan);

    divTotales.appendChild(subtotalParrafo);

    // Propina
    const propinaParrafo = document.createElement('p');
    propinaParrafo.classList.add('fs-4', 'fw-bold', 'mt-3');
    propinaParrafo.textContent = `Propina: `;

    const propinaSpan = document.createElement('SPAN');
    propinaSpan.classList.add('fw-normal');
    propinaSpan.textContent = `$${propina}`;

    propinaParrafo.appendChild(propinaSpan);

    //Aqui agregamos al Div principal de propina
    divTotales.appendChild(propinaParrafo);
    divTotales.appendChild(propinaParrafo);

    // TOTAL
    const totalParrafo = document.createElement('p');
    totalParrafo.classList.add('fs-4', 'fw-bold', 'mt-3');
    totalParrafo.textContent = `Total: `;

    const totalSpan = document.createElement('SPAN');
    totalSpan.classList.add('fw-normal');
    totalSpan.textContent = `$${total}`;

    totalParrafo.appendChild(totalSpan);

    //Eliminar el ultimo resultado

    const totalPagarDiv = document.querySelector('.total-pagar');
    if (totalPagarDiv) {
        totalPagarDiv.remove();
    }

    //Aqui agregamos al Div principal de propina
    divTotales.appendChild(propinaParrafo);
    divTotales.appendChild(propinaParrafo);
    divTotales.appendChild(totalParrafo);

    //Para seleccionar un hijo usualmente usamos la syntaxis '.formulario div'
    //Anque la syntaxis '.formulario > div' tambien es valida
    const formulario = document.querySelector('.formulario > div');
    formulario.appendChild(divTotales);
}

