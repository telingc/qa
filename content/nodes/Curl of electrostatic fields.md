---
id: electrostatic-curl
subject: Physics
topic: Electrodynamics
---
## Line Integral & Closed Path Integral

Electrostatic field of a point charge is $$\textbf{E}=\frac{1}{4\pi\epsilon_0}\frac{q}{r^2}\hat{\mathbf{r}}$$ and we can calculate its line integral$$\int_\mathbf{a}^\mathbf{b}\textbf{E}\cdot d\mathbf{l},\quad d\mathbf{l}=dr\,\hat{\mathbf{r}}+r\,d\theta\,\hat{\mathbf{\theta}}+r\,\sin\theta\,d\phi\,\hat{\mathbf{\phi}}\Rightarrow\frac{1}{4\pi\epsilon_0}\int_\mathbf{a}^\mathbf{b}\frac{q}{r^2}\, dr$$$$\frac{1}{4\pi\epsilon_0}\int_\mathbf{a}^\mathbf{b}\frac{q}{r^2}\, dr\Rightarrow\frac{1}{4\pi\epsilon_0}(\frac{q}{r_a}-\frac{q}{r_b})$$From the integral above, the line integral $\int_\mathbf{a}^\mathbf{b}\textbf{E}\cdot d\mathbf{l}=0$ when $r_a = r_b$ , thus$$\oint\mathbf{E}\cdot d\,\mathbf{l}=0$$Using Stokes theorem, we can infer:$$\oint\mathbf{E}\cdot d\,\mathbf{l}=\int_V\nabla\times\mathbf{E}\cdot d\,\tau=0\Rightarrow\nabla\times\mathbf{E}=0$$
## Intuitive Understanding
Electrostatic field is a irrotational field, but let's imagine that what if electrostatic field is rotational? We put a test charge into the electrostatic field, there exists a certain point where $\mathrm{curl}\,\mathbf{E}\neq0$, keeps the test charge rotating and accelerating. And it may stimulate magnetic field, attracts more charges.

The goal is that we want to figure out an trivial way to calculate the work the field done to charges or objects, If we consider the charge to be stable, then we can use Coulomb's law$$\mathbf{F}=q\mathbf{E}$$to infer that we can calculate $\mathbf{W}=\displaystyle \int\mathbf{F}\cdot d\,\mathbf{l}$  by calculating $$\displaystyle \int\mathbf{F}\cdot d\,\mathbf{l}=\displaystyle q\int\mathbf{E}\cdot d\,\mathbf{l}$$Since the line integral is only related to the distance between test charge and point charge, it's intuitive to come up with the idea of electric potential:$$V(\mathbf{r})\equiv-\int_{\mathcal{O}}^\mathbf{r}\mathbf{E}\cdot d\,\mathbf{l}$$