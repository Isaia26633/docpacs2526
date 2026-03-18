const fs = require('fs')
const { parse } = require('csv-parse/sync')

const csv = fs.readFileSync('data.csv', 'utf8')

const records = parse(csv, {
    columns: true,
    trim: true,
})

const orders = {}

for (const record of records) {
    // Process each record
    const customerName = record["Customer"];
    const orderId = record["Order ID"];
    const address = record["Address"];
    const itemName = record["Item"];
    const priceText = record["Price"];
    const quantityText = record["Quantity"];

    if (!orderId || !customerName) {
        continue;
    }
    // remove the dollar sign from the price string and convert it to a number
    const unitPrice = parseFloat(String(priceText).replace("$", ""));
    const quantity = parseInt(quantityText, 10);

    if (isNaN(unitPrice) || isNaN(quantity)) {
        continue;
    }

    const total = unitPrice * quantity;

    // if the id has not been seen before then create a new order entry
    if (!orders[orderId]) {
        orders[orderId] = {
            customer: customerName,
            address: address,
            items: [],
            subtotal: 0,
        };
    }

    // add it to the order list
    orders[orderId].items.push({
        name: itemName,
        unitPrice: unitPrice,
        quantity: quantity,
        total: total
    })

    orders[orderId].subtotal += total
}
// console.log(orders)

const salesTax = 0.06

let grandSubtotal = 0
let grandTaxTotal = 0
let grandShippingTotal = 0
let grandFinalTotal = 0
let highestPurchase = 0
let orderCount = 0

// print the setup header
console.log("              order report                ")
console.log("------------------------------------------")


// loop through each order and calculate the price and total
for (const orderId in orders) {
    const order = orders[orderId]
    orderCount++

    for (const item of order.items) {
        const customerCol = order.customer.padEnd(15, " ")

        const itemCol = item.name.padEnd(15, " ")

        const mathText = `${item.quantity} x ${item.unitPrice.toFixed(2)} = ${item.total.toFixed(2)}`;

        console.log(`${customerCol}  ${itemCol}  ${mathText}`);
    }

    const orderSubtotal = order.subtotal
    const orderTax = orderSubtotal * salesTax

    // shipping fee is applied for orders over $50
    const orderShipping = orderSubtotal > 50 ? 0 : 10;

    const orderFinalTotal = orderShipping + orderSubtotal + orderTax
    
    // math stuff
    grandSubtotal += orderSubtotal;
    grandTaxTotal += orderTax;
    grandShippingTotal += orderShipping;
    grandFinalTotal += orderFinalTotal;

    // sets the highest purchase if the current order is more than the highest purchase
    if(orderFinalTotal > highestPurchase){
        highestPurchase = orderFinalTotal;
    }
}

// find the average purchase
const averagePurchase = orderCount > 0 ? grandFinalTotal / orderCount : 0

// function for printing the orders in the proper format
function cliPrint(label, amount) {
    const labelCol = label.padEnd(25, " ");
    const amountCol = amount.toFixed(2).padStart(8, " ")
    console.log(`${labelCol}${amountCol}`)
}
console.log("------------------------------------------")
cliPrint("Subtotal:", grandSubtotal)
cliPrint("Sales tax (6%):", grandTaxTotal)
cliPrint("Grand total:", grandFinalTotal)
cliPrint("Average purchase amount:", averagePurchase)
cliPrint("Highest purchase:", highestPurchase)