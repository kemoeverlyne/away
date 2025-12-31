import datetime
from flask import Flask, request, jsonify
from flask_graphql import GraphQLView
from flask_cors import CORS
import graphene
from enum import Enum

app = Flask(__name__)
CORS(app)

loans = [
    {
        "id": 1,
        "name": "Tom's Loan",
        "interest_rate": 5.0,
        "principal": 10000,
        "due_date": datetime.date(2025, 3, 1),
    },
    {
        "id": 2,
        "name": "Chris Wailaka",
        "interest_rate": 3.5,
        "principal": 500000,
        "due_date": datetime.date(2025, 3, 1),
    },
    {
        "id": 3,
        "name": "NP Mobile Money",
        "interest_rate": 4.5,
        "principal": 30000,
        "due_date": datetime.date(2025, 3, 1),
    },
    {
        "id": 4,
        "name": "Esther's Autoparts",
        "interest_rate": 1.5,
        "principal": 40000,
        "due_date": datetime.date(2025, 3, 1),
    },
]

loan_payments = [
    {"id": 1, "loan_id": 1, "payment_date": datetime.date(2025, 3, 4), "amount": 10500},
    {"id": 2, "loan_id": 2, "payment_date": datetime.date(2025, 3, 15), "amount": 50000},
    {"id": 3, "loan_id": 3, "payment_date": datetime.date(2025, 4, 5), "amount": 30000},
]


class PaymentStatus(Enum):
    ON_TIME = "OnTime"     
    LATE = "Late"        
    DEFAULTED = "Defaulted" 
    UNPAID = "Unpaid"    

class PaymentStatusType(graphene.Enum):
    ON_TIME = PaymentStatus.ON_TIME.value
    LATE = PaymentStatus.LATE.value
    DEFAULTED = PaymentStatus.DEFAULTED.value
    UNPAID = PaymentStatus.UNPAID.value

def calculate_payment_status(payment_date, due_date):
    if not payment_date:
        return PaymentStatus.UNPAID.value
        
    days_diff = (payment_date - due_date).days
    
    if days_diff <= 5:
        return PaymentStatus.ON_TIME.value
    elif days_diff <= 30:
        return PaymentStatus.LATE.value
    else:
        return PaymentStatus.DEFAULTED.value

class LoanPayment(graphene.ObjectType):
    id = graphene.Int()
    loanId = graphene.Int()
    paymentDate = graphene.Date()
    status = graphene.Field(PaymentStatusType)
    amount = graphene.Int()

    def resolve_status(self, info):
        if not self.paymentDate:
            return PaymentStatus.UNPAID.value
        
        loan = next((loan for loan in loans if loan["id"] == self.loanId), None)
        if not loan:
            return PaymentStatus.UNPAID.value
            
        return calculate_payment_status(self.paymentDate, loan["due_date"])

class ExistingLoans(graphene.ObjectType):
    id = graphene.Int()
    name = graphene.String()
    interestRate = graphene.Float()
    principal = graphene.Int()
    dueDate = graphene.Date()
    payments = graphene.List(LoanPayment)

    def resolve_payments(self, info):
        loan_payments_list = []
        for payment in loan_payments:
            if payment["loan_id"] == self.id:
                payment_data = {
                    "id": payment["id"],
                    "loanId": payment["loan_id"],
                    "paymentDate": payment["payment_date"],
                    "amount": payment["amount"]
                }
                payment_obj = LoanPayment(**payment_data)
                loan_payments_list.append(payment_obj)
        return loan_payments_list

class CreateLoan(graphene.Mutation):
    class Arguments:
        name = graphene.String(required=True)
        interestRate = graphene.Float(required=True)
        principal = graphene.Int(required=True)
        dueDate = graphene.Date(required=True)

    loan = graphene.Field(ExistingLoans)
    success = graphene.Boolean()
    message = graphene.String()

    def mutate(self, info, name, interestRate, principal, dueDate):
        try:
            if isinstance(dueDate, datetime.date):
                date_obj = dueDate
            else:
                try:
                    date_obj = datetime.datetime.strptime(str(dueDate), "%Y-%m-%d").date()
                except ValueError as ve:
                    return CreateLoan(success=False, message=f"Invalid date format: {str(ve)}")

            new_loan = {
                "id": len(loans) + 1,
                "name": name,
                "interest_rate": float(interestRate),
                "principal": int(principal),
                "due_date": date_obj
            }
            loans.append(new_loan)

            return CreateLoan(
                loan=ExistingLoans(
                    id=new_loan["id"],
                    name=new_loan["name"],
                    interestRate=new_loan["interest_rate"],
                    principal=new_loan["principal"],
                    dueDate=new_loan["due_date"]
                ),
                success=True,
                message="Loan created successfully"
            )
        except Exception as e:
            return CreateLoan(success=False, message=str(e))

class AddPayment(graphene.Mutation):
    class Arguments:
        loanId = graphene.Int(required=True)
        paymentDate = graphene.String(required=True)
        amount = graphene.Int(required=True)

    payment = graphene.Field(LoanPayment)
    success = graphene.Boolean()
    message = graphene.String()

    def mutate(self, info, **kwargs):
        try:
            loan_id = kwargs.get("loanId") or kwargs.get("loan_id")
            payment_date = kwargs.get("paymentDate") or kwargs.get("payment_date")
            amount = kwargs.get("amount")

            loan = next((loan for loan in loans if loan["id"] == loan_id), None)
            if not loan:
                return AddPayment(success=False, message="Loan not found")

            try:
                date_obj = datetime.datetime.strptime(payment_date, "%Y-%m-%d").date()
            except ValueError as ve:
                return AddPayment(success=False, message=f"Invalid date: {str(ve)}")

            new_payment = {
                "id": len(loan_payments) + 1,
                "loan_id": loan_id,
                "payment_date": date_obj,
                "amount": int(amount)
            }
            loan_payments.append(new_payment)

            return AddPayment(
                payment=LoanPayment(
                    id=new_payment["id"],
                    loanId=new_payment["loan_id"],
                    paymentDate=new_payment["payment_date"],
                    amount=new_payment["amount"]
                ),
                success=True,
                message="Payment added successfully"
            )
        except Exception as e:
            return AddPayment(success=False, message=str(e))

class Mutation(graphene.ObjectType):
    addPayment = AddPayment.Field()
    createLoan = CreateLoan.Field()

class Query(graphene.ObjectType):
    loans = graphene.List(ExistingLoans)

    def resolve_loans(self, info):
        loan_list = []
        for loan in loans:
            loan_obj = ExistingLoans(
                id=loan["id"],
                name=loan["name"],
                interestRate=loan["interest_rate"],
                principal=loan["principal"],
                dueDate=loan["due_date"]
            )
            loan_list.append(loan_obj)
        return loan_list

schema = graphene.Schema(query=Query, mutation=Mutation)

app.add_url_rule(
    '/graphql',
    view_func=GraphQLView.as_view(
        'graphql',
        schema=schema,
        graphiql=True,  
        get_context=lambda: {'session': None}  
    )
)

@app.route("/api/payments", methods=["POST"])
def add_payment():
    try:
        data = request.get_json()
        
        required_fields = ["loanId", "paymentDate", "amount"]
        for field in required_fields:
            if field not in data:
                return jsonify({
                    "success": False,
                    "message": f"Missing required field: {field}"
                }), 400

        loan_id = data["loanId"]
        payment_date = datetime.datetime.strptime(data["paymentDate"], "%Y-%m-%d").date()
        amount = data["amount"]

        loan = next((loan for loan in loans if loan["id"] == loan_id), None)
        if not loan:
            return jsonify({
                "success": False,
                "message": "Loan not found"
            }), 404

        new_payment = {
            "id": len(loan_payments) + 1,
            "loan_id": loan_id,
            "payment_date": payment_date,
            "amount": amount
        }
        loan_payments.append(new_payment)

        status = calculate_payment_status(payment_date, loan["due_date"])

        return jsonify({
            "success": True,
            "message": "Payment added successfully",
            "payment": {
                "id": new_payment["id"],
                "loanId": new_payment["loan_id"],
                "paymentDate": new_payment["payment_date"].isoformat(),
                "amount": new_payment["amount"],
                "status": status
            }
        }), 201

    except ValueError as e:
        return jsonify({
            "success": False,
            "message": "Invalid date format. Use YYYY-MM-DD"
        }), 400
    except Exception as e:
        return jsonify({
            "success": False,
            "message": str(e)
        }), 500

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000, debug=True)
