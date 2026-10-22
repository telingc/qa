---
id: electric-potential
subject: Physics
topic: Electrodynamics
---
## Define Equipotential

> Here we use *Equipotential* instead to avoid ambiguity between *potential* and *potential energy*.

From our discussion of the line integral of electrostatic field $$\frac{\mathbf{W}}{q}=\displaystyle \int_{\mathbf{a}}^\mathbf{b}\mathbf{E}\cdot d\,\mathbf{l}=\frac{1}{4\pi\epsilon_0}(\frac{q}{r_a}-\frac{q}{r_a})$$We can infer that the work electrostatic field done to test charge relates to the start point and the end point only. The we define the *potential* of that point using:$$V(\mathbf{r})\equiv-\displaystyle \int_{\mathcal{O}}^\mathbf{r}\mathbf{E}\cdot d\,\mathbf{l}$$Thus we can calculate work $\mathbf{W}$ and field $\mathbf{E}$ by$$\mathbf{E}=-\nabla V,\quad \mathbf{W}=q\cdot[V(\mathbf{a})-V(\mathbf{b})]\quad(\,\mathbf{W}=\frac{1}{2}\int\rho V\,d\,\tau\,)$$
## For Non-static Fields
To avoid any possible ambiguity, I should perhaps put a prime on the integration variable:
$$V(\mathbf{r})=-\displaystyle\int_{\mathcal{O}}^{\mathbf{r}}\mathbf{E}(\mathbf{r'})\cdot d\, \mathbf{l}'$$
1. $\mathbf r$ : The coordination of the end point.
2. $\mathbf r'$ : Coordination of the current point on the integration route.
3. $\mathbf l'$ : The differentiated displacement vector.
Notice that the line integral of electrostatic field is path independent, it's recommended to find the most trivial integration path.
## The Standard Reference Point
The standard reference point of electrostatics is a point infinitely far from the charge. But if the charge distribution it self extends to infinite, this convention fails.

## Potential Obeys the Superposition Principle
$$\begin{cases}\mathbf{F}=\mathbf{F}_1+\mathbf{F}_2+\dots\\\mathbf{E}=\mathbf{E}_1+\mathbf{E}_2+\dots\\ V=V_1+V_2+\dots\end{cases}$$