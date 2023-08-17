**API**

Requirements :
- show user information with user's order total amount
- show all user
- add person
- add order
- delete order

Contratcts :
```json
GET /persons : show all user

{
    "success": true,
    "data": [
        {
            "id": 1,
            "name": "budi",
            "gender": "male",
            "department": "IT"
        },
        {
            "id": 2,
            "name": "ani",
            "gender": "female",
            "department": "HR"
        }
    ],
    "error": {}
}
```

```json
GET /persons/:id : show one user by id
{
    "success": true,
    "data":{
            "id": 1,
            "name": "budi",
            "gender": "male",
            "department": "IT",
            "amount": 100000 
        }
}
```

```json
POST /persons : add person
{
    "name": "andi",
    "gender": "male",
    "department": "HR"
}

{
    "success": true,
    "data": {
        "id": 1 // user id
    }
}
```

```json
POST /orders : add order
{
    "user_id": 1,
    "price": 900,
    "product": "tablet"
}

{
    "success": true,
    "data": {
        "id": 1 // order id
    }
}
```
```json
DELETE /orders/:id : delete order
{
    "success": true,
    "data": {
        "id": 1 // order id
    }
}
```