---
id: question-mv4vnu4t-aonx
subject: Physics
topic: Electrodynamics
---
## Poisson's Equation

We've found that the electric field can be written as the gradient of a scalar potential:$$\mathbf{E}=-\nabla V$$Then it's natural to come up with the idea: The expressions of the divergence and curl in terms of $V$.$$\begin{cases}\displaystyle \nabla\cdot\mathbf{E}=\frac{\rho}{\epsilon_0}\\\displaystyle \nabla\times\mathbf{E}=\mathbf{0}\end{cases}\Rightarrow\begin{cases}\displaystyle \nabla^2 V=-\frac{\rho}{\epsilon_0}\\\displaystyle \nabla\times(-\nabla V)=\mathbf{0}\end{cases}$$The first equation we inferred, $\displaystyle \nabla^2 V=-\frac{\rho}{\epsilon_0}$, is known as Poisson's equation. In regions where there is no charges ($\rho=0$), the equation reduces to Laplace's equation$$\displaystyle \nabla^2 V={0}\stackrel{Cartesian}{\Longrightarrow}\frac{\partial^2V}{\partial x^2}+\frac{\partial^2V}{\partial y^2}+\frac{\partial^2V}{\partial z^2}=0$$And we should mention that this is so fundamental that **the Electrostatics is basically the study of Laplace's equation**.
## Laplace's Equation
> The Electrostatics is basically the study of Laplace's equation.

At the same time, equations having the similar form with this Laplace's equation appears to be diverse in many branches of physics as gravitation, magnetism, thermodynamics and more, which are called **harmonic functions**.
### Shared Properties of Laplace's Equation in Dimensions
1. The value of $V$ at a point $(x,\,y)$ is the average of those around the point. More precisely, draw a circle, a ball or a n-dimensional ball of any radius $R$ about the point $(x,\,y)$, the average value of V on the circle is equal to the value at the center:$$V(\mathbf{x})=\frac{\displaystyle \oint_{\partial B^n_r(\mathbf{x})}V\cdot ds}{\displaystyle \oint_{\partial B^n_r(\mathbf{x})}ds}$$Notice that here we're explaining things intuitively, this is obviously not the definition of harmonic functions, but it's still a great way to understand. (Moreover, this suggests the method of relaxation, allowing computers to calculate the solutions to Laplace's equations.)
2. $V$ has no local maxima or minima; all extrema occur at the boundaries.
But we can only explain the trivial cases that there's no charges in the volume with current knowledge. Next up we're learning the uniqueness theorem.