---
id: example-griffiths4e-2-11
parent: electric-flux
---
### Questions
A thin spherical shell of radius $R$, centered at the origin, carries uniform surface charge density $\sigma$.
1. Use Gauss's law to determine the electric field for $r<R$ and for $r>R$, including its direction.
2. Compare the result with the direct source integration in Problem 2.7 ([Spherical Surface](Spherical%20Surface.md)).
### 1. Inside and outside
Gauss' law is powerful, especially when dealing with highly symmetric cases, For this case, we chose a imaginary spherical surface whose center is the same with the charged sphere as Gauss surface.
1. **Interior ($r<R$):** $$\displaystyle \oint_{\partial B_{r}(\mathcal{O})}\mathbf{E}\cdot d\,\mathbf{a}=\frac{Q_{enc}}{\epsilon_0}\Rightarrow \mathbf{E}=\mathbf{0}$$We can infer that the direction of electrostatic field $\mathbf{E}$ is same with the vector $\mathbf{a}$ and it holds the same magnitude to every point on the surface. Thus $\mathbf{E}=\mathbf{0}$ is intuitive. For more details, we keep this as a missing question for now.
2. **Exterior ($r>R$):** $$\displaystyle \oint_{\partial B_{r}(\mathcal{O})}\mathbf{E}\cdot d\,\mathbf{a}=4\pi r^2E=\frac{Q_{enc}}{\epsilon_0}\Rightarrow \mathbf{E}=\frac{q}{4\pi\epsilon_0r^2}\cdot\hat{\mathbf{z}}$$
### 2. Comparison with source integration
It's the same result but simpler and more elegant.
$$\mathbf{E}=\begin{cases}\mathbf{0},\quad\quad\qquad\,\,\,0\leqslant z< R\\\displaystyle\frac{q}{4\pi\epsilon_0z^2}\cdot\hat{\mathbf{z}},\,\,\, z>R\end{cases}$$
## Missing Question
> Which symmetry arguments let you infer a field from its flux here, and what fails if the surface charge density depends on angle?

If surface charge density depends on angle, then $\mathbf{E}$ isn't angle independent, which means the surface integral couldn't use the symmetric property of $\mathbf{E}$, then we can't infer $\mathbf{E}=\mathbf{0}$ even the integral is $0$.
The symmetric property we need for using Gauss' law is no existing tangential field component, which is quite intuitive from the perspective considering part of the integral $\mathbf{E}\cdot d\,\mathbf{a}$.
## Source
Griffiths, *Introduction to Electrodynamics*, 4th edition (2013), Problem 2.11, printed p. 76 (PDF p. 95). Faithful paraphrase of the original tasks; any extension is marked optional.
