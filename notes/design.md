#Thinking in React

Similar to Facebook's great introduction to React, [Thinking in React](https://facebook.github.io/react/docs/thinking-in-react.html), I'll start by breaking down the existing design into React-sied components.

##Principles



![alt tag](/public/img/mockup.png)

## Component Hierarchy

I broke down the existing UI into components based on the [single responsibility principle](https://en.wikipedia.org/wiki/Single_responsibility_principle). Here's what we end up with:

1. App (blue): the entire app
2. Map (orange): displays our canvas-rendered globe
3. Input (pink): receives user input
4. GameActions: container for our user actions
5. ActionButton: triggers specific actions (Next or Hint)
6. Score (green): displays the current score
7. Timer (light blue): displays the elapsed time


