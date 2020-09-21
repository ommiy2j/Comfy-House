//variables 

const cartbtn=document.querySelector('.cart-btn');
const closeCartBtn=document.querySelector('.close-cart');
const clearCartBtn=document.querySelector('.clear-cart');
const cartDOm=document.querySelector('.cart');
const cartOverlay=document.querySelector('.cart-overlay');
const cartItems=document.querySelector('.cart-items');
const cartTotals=document.querySelector('.cart-total');
const cartContent=document.querySelector('.cart-content');
const productDOM=document.querySelector('.products-center');
const cartfooter=document.querySelector('.cart-footer');
const shopNow=document.querySelector('.shop-now');
const hero=document.querySelector('.hero');
const down=document.querySelector('.fa-chevron-down');
const up=document.querySelector('.fa-chevron-up');
const itemAmt=document.querySelector('.item-amount');
//for hero


//cart 
let cart=[]
//buttons
let buttonDom=[]

//getting the products

class Products{
    async getProducts(){
        try{
            let result=await fetch('products.json');
            let data=await result.json();
            let products=data.items;
            //let x=products[0].fields.title;
            products=products.map(item =>{
                const {title,price}=item.fields;
                const {id} =item.sys
                const image=item.fields.image.fields.file.url;
                return {title,price,id,image}
            })

            return products
        }
        catch(error){
            console.log(error)
        }
        
    }
}

//display products
class UI{
    displayProducts(products){
       // console.log(products)
       let result ='';
       products.forEach(product => {
            result +=`
            <article class="product">
                  <div class="img-container">
                      <img src=${product.image} alt="" class="product-img">
                      <button class="bag-btn" data-id=${product.id}>
                          <i class="fas fa-shopping-cart"></i>
                          Add to Cart
                      </button>
                  </div>
                  <h3>${product.title}</h3>
                  <h4>&#8377 ${product.price}</h4>
              </article>
              `;
       });
       productDOM.innerHTML=result; 
    }
    getBagButton(){
        const buttons=[...document.querySelectorAll('.bag-btn')];
        buttonDom=buttons;
        //console.log(buttonDom)
        buttons.forEach(button=>{
            let id=button.dataset.id;
            //console.log(id)
            let inCart=cart.find(item => item.id===id);
            if(inCart){
                button.innerText="In Cart"
                button.disabled=true;
            }
            
            button.addEventListener('click',(event)=>{
               //swal("Item Added In Cart!");
                event.target.innerText="In Cart"
                event.target.disabled=true;
                //get products 
                let cartItem={...Storage.getProducts(id),amount:1};
                //console.log(cartItem)
                //add prodcts to cart
                cart=[...cart,cartItem]
                //console.log(cart)
                //save cart in local storage
                Storage.saveCart(cart);
                //set cart values
                this.setcartvalues(cart)
                //display cart item
                this.addCartItem(cartItem)
                //show cart
                //this.showCart(); 
                //closeCart
                this.closeCart();
                });
        });
    }
    setcartvalues(cart){
        let tempTotal=0;
        let itemTotal=0;
        cart.map(item => {
            tempTotal+=item.price * item.amount;
            itemTotal+=item.amount;
        });
        cartTotals.innerText = parseFloat(tempTotal.toFixed(2));
        cartItems.innerText = itemTotal;
        //console.log(cartTotals,cartItems)
        
    }
    addCartItem(item){
        const div = document.createElement('div');
        div.classList.add('cart-item');
        div.innerHTML=`
        <img src="${item.image}" alt="">
        <div>
           <h4>${item.title}</h4>
           <h5>&#8377 ${item.price}</h5>
           <span class="remove-item" data-id=${item.id}>Remove</span>
        </div>
       <div>
           <i class="fas fa-chevron-up data" data-id='${item.id}'></i>
           <p class="item-amount">${item.amount}</p>
           <i class="fas fa-chevron-down" data-id='${item.id}'></i>
       </div>
        `;
        //cartContent.insertBefore(div,cartfooter)
        cartContent.appendChild(div);
        //console.log(cartContent)  
    }
    showCart(){
        cartOverlay.classList.add('transparentBcg');
        cartDOm.classList.add('showCart');
    }
    hideCart(){
        cartOverlay.classList.remove('transparentBcg');
        cartDOm.classList.remove('showCart');
    }
    closeCart(){
        closeCartBtn.addEventListener('click',()=>{
            cartOverlay.classList.remove('transparentBcg');
            cartDOm.classList.remove('showCart');
        })
    }
    setUpAPP(){
        cart =Storage.getcart();
        this.setcartvalues(cart);
        this.populateCart(cart);
        cartbtn.addEventListener('click',this.showCart);
        closeCartBtn.addEventListener('click',this.closeCart);
    }
    populateCart(cart){
        cart.forEach(item => {
            this.addCartItem(item);
        })
    }
    cartLogic(){
        clearCartBtn.addEventListener('click',()=>{this.clearCart()});

        cartContent.addEventListener('click',event=>{
        //    console.log(event.target)
        if(event.target.classList.contains('remove-item')){
            let removeItem=event.target;
            // console.log(removeItem.parent)
            let id=removeItem.dataset.id;
            removeItem.parentElement.parentElement.remove();
            this.removeItem(id);
    
        }
        else if(event.target.classList.contains('fa-chevron-up')){
            let addAmt=event.target;
            let id=addAmt.dataset.id;
            let tempItem=cart.find(item => item.id===id);
            tempItem.amount+=1;
            Storage.saveCart(cart);
            this.setcartvalues(cart);
            addAmt.nextElementSibling.innerText=tempItem.amount;
        }

        else if(event.target.classList.contains('fa-chevron-down')){
            let lowerAmt=event.target;
            let id=lowerAmt.dataset.id;
            let tempItem=cart.find(item => item.id===id);
            if(tempItem.amount==0){
                lowerAmt.disabled=true;
            }
            else{
                tempItem.amount-=1;
                Storage.saveCart(cart);
                this.setcartvalues(cart);
                lowerAmt.previousElementSibling.innerText=tempItem.amount;
            }
        }
        })


        

        
    }

   
    clearCart(){
        let cartItem= cart.map(item => item.id)
       // console.log(cartItem)
       cartItem.forEach(id =>this.removeItem(id));
       while(cartContent.children.length>0){
           cartContent.removeChild(cartContent.children[0]);
       }
       this.hideCart();
    }
    removeItem(id){
        cart =cart.filter(item => item.id!=id);
        this.setcartvalues(cart);
        Storage.saveCart(cart); 
        let button=this.getSingleButton(id);
        button.disabled=false;
        button.innerHTML=`<i class="fas fa-shopping-cart"></i>Add to cart`;
    }
    getSingleButton(id){
        return buttonDom.find(button =>button.dataset.id===id);
    }
}

//local storage
class Storage{
      static saveProducts(products){
          localStorage.setItem("products",JSON.stringify(products))
      }
      static getProducts(id){
          let products=JSON.parse(localStorage.getItem('products'));
          return products.find(product =>product.id===id)
      }
      static saveCart(cart){
          localStorage.setItem('cart',JSON.stringify(cart));
      }
      static getcart(){
          return localStorage.getItem('cart')?JSON.parse(localStorage.getItem('cart')):[];
      }
}

document.addEventListener("DOMContentLoaded", () => {
     const ui= new UI();
     const products= new Products();

     //set up app
     ui.setUpAPP();

     //get all products
    products.getProducts().then(products => {
        ui.displayProducts(products);
        Storage.saveProducts(products);
    }).then(()=>{ui.getBagButton()
                ui.cartLogic()
    });
});