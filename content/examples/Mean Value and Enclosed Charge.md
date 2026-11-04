---
id: example-mvuo14dq-hfuv0k
parent: question-mv4vnu4t-aonx
---
## Question
1. Find the average potential over a spherical surface of radius $R$ due to a point charge $q$ located a distance $z$ from the center inside the sphere (only with $z<R$). Laplace's equation does not hold within the sphere. Show that in general,$$V_\text{ave}=V_\text{center}+\frac{Q_\text{enc}}{4\pi\epsilon_0R},$$where $V_\text{center}$ is the potential at the center due to all the external charges, and $Q_\text{enc}$ is the total enclosed charge.
2. An alternative argument that does not rely on Coulomb's law, only on Laplace's equation: Set the origin at $P$. Let $V_\text{ave}(R)$ be the average; first show that$$\frac{dV_\text{ave}}{dR}=\frac{1}{4\pi R^2}\oint\nabla V\cdot d\,\mathbf a$$Now use the divergence theorem, and conclude that if $V$ satisfies Laplace's equation, then $V_\text{ave}(R)=V_\text{ave}(0)=V(P)$, for all $R$.
## Spherical Average Potential
This is a trivial case for a specific point,$$V=\frac{1}{4\pi\epsilon_0}\frac{q}{r}.$$Then we calculate the average potential of all points on the spherical surface:$$\begin{align*}V_\text{ave}&=\frac{\displaystyle \oint_{\partial B}\frac{q}{4\pi\epsilon_0s}dS}{\displaystyle \oint_{\partial B} dS}\\&=\frac{\displaystyle q\oint_{\partial B}\frac{dS}{s}}{\displaystyle 16\pi^2\epsilon R^2}\\&=\displaystyle \frac{q}{4\pi\epsilon_0R}\end{align*}$$
Note that $V_\text{center}$ is the potential at the center, due to all the external charges, and the calculation of potential obeys the principle of superposition. Thus the question is, without the point charge in the sphere, is $V_\text{ave}=V_\text{center}$ true?

If there's no charge distributed inside the sphere, Laplace's equation is satisfied in this case$$\nabla^2V_\text{ext}=0.$$
This seems a non-trivial question, turns out to be a question about *the mean value property of harmonic functions*.

Thus we came into a conclusion that $\langle V_\text{ext}\rangle=V_\text{center}$, then we use the superposition principle, $$\begin{align*}V_\text{ave}&=\langle V_\text{in}\rangle+\langle V_\text{ext}\rangle\\&=\displaystyle \frac{q}{4\pi\epsilon_0R}+V_\text{center}.\end{align*}$$
## Mean Value Argument
Similarly we calculate the mean value of a spherical area, 
$$V_{\mathrm{ave}}(R) =\frac{1}{4\pi R^2}\oint_{S_R}V\,da,$$but now we're writing it into the solid angle form$$ V_{\mathrm{ave}}(R) =\frac{1}{4\pi}\int_{4\pi} V(P+R\hat{\mathbf r})\,d\Omega \\\Rightarrow \frac{dV_{\mathrm{ave}}}{dR} = \frac{1}{4\pi}\int_{4\pi} \frac{\partial V}{\partial R}\,d\Omega$$and the partial differentiation satisfies $\displaystyle\frac{\partial V}{\partial R} =\nabla V\cdot\hat{\mathbf r}$ and $d\mathbf a=R^2\hat{\mathbf r}\,d\Omega$, thus we can finally have$$\frac{dV_{\mathrm{ave}}}{dR} = \frac{1}{4\pi R^2} \oint_{S_R}\nabla V\cdot d\mathbf a.$$
> [!warning] **A wrongly discussed method**
> Here is a mistake that I take the result of the previous question and the Gauss' law as known conditions: 
> 1. $\displaystyle \oint\mathbf E \cdot d\,\mathbf a=\frac{Q_\text{enc}}{\epsilon_0}$
> 2. $V_\text{ave}=\displaystyle \frac{q}{4\pi\epsilon_0R}+V_\text{center}$
> 3. $\mathbf E=-\nabla V$
> 
> the potential at the center is a constant, then we have$$\begin{align*}\frac{dV_\text{ave}}{dR}&=-\frac{1}{4\pi R^2}\cdot \frac{Q_\text{enc}}{\epsilon_0}\\&=-\frac{1}{4\pi R^2}\cdot \oint\mathbf E \cdot d\,\mathbf a\\&=\frac{1}{4\pi R^2}\cdot\oint\nabla V\cdot d\,\mathbf a.\end{align*}$$
## Source
1. Griffiths, *Introduction to Electrodynamics*, 4th edition (2013), Problem 3.1, printed p.119. Faithful paraphrase of the original tasks; any extension is marked optional.
2. Griffiths, *Introduction to Electrodynamics*, 4th edition (2013), Problem 3.37, printed p.160. Faithful paraphrase of the original tasks; any extension is marked optional.