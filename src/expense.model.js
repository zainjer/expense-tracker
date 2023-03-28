export class Expense {
   constructor(
        date,
        type,
        description,
        amount,
        availableBalance
   ){
        this.date = date;
        this.type = type;
        this.description = description;
        this.amount = amount;
        this.availableBalance = availableBalance;
   }
}