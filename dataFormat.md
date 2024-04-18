# Data Format

## user
```js
{
    userID: string,
    email: string,
    type: string, //parent, children or babysitter
    parentID: string, //Empty if user is parent
    balance: number,
    lifetimeEarning: numer,
}
```

## chore
```js
{
    userID: string, //belong to
    title: string,
    reward: number,
    progress: string //completed, in-process or pending-approval
    deadline: date
    feedback: string, //Can be made by babysitter
}
```

## transaction
```js
{
    userID: string, //belong to
    title: string,
    type: string, //withdraw or choreCompletion
    timestamp: date,
    approved: boolean //false on creation, set to true once parents approve
}
```