---
id: question-mvlo35rc-wba7
subject: Physics
topic: Electrodynamics
---
> *[Method of Images](Method%20of%20Images.md)* and *Separation of Variables* help us construct solutions to electrostatic boundary-value problems. Here we focus on separation of variables for Laplace’s equation.
## Key Insights
1. **The Product Ansatz.** We construct separated solutions without assuming that every solution is a single product. Combining these solutions at the end.
2. **Independent Variables $\Rightarrow$ Separation Constants.** We must first rearrange the equation into expressions that depend on separate variables.
3. **Boundary Conditions.** They restrict the separated solutions and determine how we combine them.
4. **Superposition Finds the Unique Solution.** A candidate becomes the desired solution once it satisfies the equation and all the required boundary conditions.
## Cartesian Coordinates
We begin with Laplace’s equation,
$$
\nabla^2V
=\frac{\partial^2V}{\partial x^2}
+\frac{\partial^2V}{\partial y^2}
+\frac{\partial^2V}{\partial z^2}
=0,
$$
and try a product solution:
$$
V(x,y,z)=X(x)Y(y)Z(z).
$$
Substituting and dividing by $XYZ$ where the factors are nonzero gives$$\frac{X''}{X}+\frac{Y''}{Y}+\frac{Z''}{Z}=0.$$
Each term must be constant. To see why, hold $y$ and $z$ fixed: the last two terms become fixed numbers, so the first term cannot change as $x$ varies. The same argument applies to the other terms.

We therefore obtain
$$
X''=\lambda_xX,\qquad
Y''=\lambda_yY,\qquad
Z''=\lambda_zZ,
\qquad
\lambda_x+\lambda_y+\lambda_z=0.
$$

For a real separation constant, the possible forms of $X$ are
$$
X(x)=
\begin{cases}
Ae^{kx}+Be^{-kx},&\lambda_x=k^2>0,\\[2mm]
A\cos(kx)+B\sin(kx),&\lambda_x=-k^2<0,\\[2mm]
A+Bx,&\lambda_x=0,
\end{cases}
\qquad k>0.
$$
The same classification applies to $Y$ and $Z$, with their own parameters.
### Combining Separated Solutions
Choosing constants whose sum is zero, and functions satisfying the corresponding ordinary differential equations, gives a separated solution
$$
V_n=X_nY_nZ_n.
$$
A single product generally cannot match all the prescribed boundary values. However, Laplace’s equation is linear, so
$$
V=\sum_{n=1}^{N}C_nV_n
\quad\Rightarrow\quad
\nabla^2V=\sum_{n=1}^{N}C_n\nabla^2V_n=0.
$$

We choose separated solutions that already satisfy some boundary conditions, usually the homogeneous ones, and determine their coefficients by matching the remaining boundary values.

Sometimes an infinite series is needed. Its convergence and term-by-term differentiation must then be justified.

This does not contradict uniqueness: the individual terms generally satisfy only part of the boundary conditions. Their combination is one function. If it satisfies all the required conditions, the uniqueness theorem identifies it as the solution.
## Spherical Coordinates
We use the same product ansatz:
$$
V(r,\theta,\phi)=R(r)\Theta(\theta)\Phi(\phi).
$$
Substitution into Laplace’s equation, division by $R\Theta\Phi$ where nonzero, and multiplication by $r^2$ give
$$
\frac1R\frac{d}{dr}(r^2R')
+\frac1{\Theta\sin\theta}\frac{d}{d\theta}(\sin\theta\,\Theta')
+\frac{\Phi''}{\Phi\sin^2\theta}
=0.
$$

The last term still depends on both angles, so we separate the radial dependence first, then the angular dependence. The resulting equations are
$$
\boxed{
\begin{aligned}
\frac{d}{dr}(r^2R')&=\lambda_rR,\\[2mm]
\frac1{\sin\theta}\frac{d}{d\theta}(\sin\theta\,\Theta')
+\left(\lambda_r+\frac{\lambda_\phi}{\sin^2\theta}\right)\Theta&=0,\\[2mm]
\Phi''&=\lambda_\phi\Phi.
\end{aligned}
}
$$

> [!note]- Angular separation
> Set the radial term equal to $\lambda_r$. Multiplying the remaining equation by $\sin^2\theta$ gives
> $$
> \underbrace{
> \frac{\sin\theta}{\Theta}\frac{d}{d\theta}(\sin\theta\,\Theta')
> +\lambda_r\sin^2\theta
> }_{\text{depends only on }\theta}
> +
> \underbrace{\frac{\Phi''}{\Phi}}_{\text{depends only on }\phi}
> =0.
> $$
> We can now set $\Phi''/\Phi=\lambda_\phi$ and the first expression equal to $-\lambda_\phi$.

For an axisymmetric potential, $\partial V/\partial\phi=0$. We may take $\Phi=1$, giving $\lambda_\phi=0$ and simplifying the angular equation.

Boundary conditions and regularity requirements further restrict the constants and solutions. The coordinate system changes the equations, but the construction follows the same principle.

---
## LLM-use
This note was refined by LLM, the original note is here, It's really too long and too boring for me:

---

> *[Method of Images](Method%20of%20Images.md)* and *Separation of Variables* are both one way to find the unique solution to the Laplace's equation. So here we're just introducing the mathematical tools we need. 
> **And this note is lacking graphic demonstrations!** It may be a torture to read.

**Key insights in this note:**

> 1. **The Product Ansatz.** We construct separated solutions without assuming that every solution is a single product. Combining these solutions at the end.
> 2. **Independent Variables $\Rightarrow$ Separation Constants.** We must first rearrange the equation into expressions that depend on separate variables.
> 3. **Boundary Conditions.** They restrict the separated solutions and determine how we combine them.
> 4. **Superposition Finds the Unique Solution.** A candidate becomes the desired solution once it satisfies the equation and all the required boundary conditions.

The rest of this note isn't that enjoyable.
## Cartesian Coordinates
Here I'm using a 3-dimensional case for example. In mathematical terms, we must solve Laplace’s equation,$$\frac{\partial^2V}{\partial x^2}+\frac{\partial^2V}{\partial y^2}+\frac{\partial^2V}{\partial z^2}=0.$$And the first step, is to look for solutions in term of products:$$V(x,y,z)=X(x)Y(y)Z(z).$$Unfortunately, the overwhelming majority of solutions to Laplace’s equation do not have such a form. We're doing this kind of assumption because without a certain theory.

We begin with a product ansatz to construct a useful family of solutions, rather than assuming that every solution has this form. Then we can separate the variables in the differential equation:$$X''YZ+XY''Z+XYZ''=0$$Where $XYZ\neq0$, dividing by $XYZ$ gives$$ \frac{1}{X}X''+\frac{1}{Y}Y''+\frac{1}{Z}Z''=0.$$For $\displaystyle \frac{X''}{X}$, $\displaystyle \frac{Y''}{Y}$ and $\displaystyle \frac{Z''}{Z}$ three parts, they're all **constants**. This may be confusing, and here is why:

If you fix two variables, we take $y=y_0,\,z=z_0$ for example, $\displaystyle \frac{1}{Y}\frac{\partial^2Y}{\partial y^2}$ and $\displaystyle \frac{1}{Z}\frac{\partial^2Z}{\partial z^2}$ are two functions that only determined by variable $y$ and $z$ separately, then $$\frac{1}{Y}\frac{\partial^2Y}{\partial y^2}\bigg|_{y=y_0}+\frac{1}{Z}\frac{\partial^2Z}{\partial z^2}\bigg|_{z=z_0}=\text{constant}\,,$$thus whatever $x$ is, it can and only be a constant $\lambda_x$. Now we can say $$\begin{align*}X''&=\lambda_xX\\Y''&=\lambda_yY\\Z''&=\lambda_zZ\end{align*}.$$And $\lambda_x+\lambda_y+\lambda_z=0$, thus we can solve the single variable differential equation:$$X(x)= \begin{cases} Ae^{kx}+Be^{-kx},&\lambda_x=k^2>0,\\[2mm] A\cos(kx)+B\sin(kx),&\lambda_x=-k^2<0,\\[2mm] A+Bx,&\lambda_x=0. \end{cases} \qquad k>0.$$
Choose separation constants satisfying
$$
\lambda_x+\lambda_y+\lambda_z=0,
$$
and functions satisfying
$$
X''=\lambda_xX,\qquad
Y''=\lambda_yY,\qquad
Z''=\lambda_zZ.
$$
Their product $V=XYZ$ then satisfies Laplace's equation.

Each suitable choice gives a separated solution $V_n(x,y,z)=X_n(x)Y_n(y)Z_n(z).$ However, a single product usually cannot satisfy all the prescribed boundary conditions.

This does not mean that separation of variables has failed: we can combine these solutions.
### Superposition of Separated Solutions
Laplace's equation is linear. If each $V_n$ satisfies $\nabla^2V_n=0$, then any finite linear combination also satisfies it:
$$
V=\sum_{n=1}^{N}C_nV_n
\quad\Rightarrow\quad
\nabla^2V
=\sum_{n=1}^{N}C_n\nabla^2V_n
=0,
$$
where the coefficients $C_n$ are constants. We therefore choose separated solutions that already satisfy some of the boundary conditions, usually the homogeneous ones. We then determine the coefficients by matching the remaining boundary values. In many problems, this requires an infinite series:
$$
V(x,y,z)=\sum_{n=1}^{\infty}C_nX_n(x)Y_n(y)Z_n(z).
$$
For an infinite sum, convergence and term-by-term differentiation must be justified; the boundary values must also be checked.
## Spherical Coordinates
In spherical coordinates, Laplace’s equation reads
$$
\frac{1}{r^2}\frac{\partial}{\partial r}
\left(r^2\frac{\partial V}{\partial r}\right)
+\frac{1}{r^2\sin\theta}\frac{\partial}{\partial\theta}
\left(\sin\theta\frac{\partial V}{\partial\theta}\right)
+\frac{1}{r^2\sin^2\theta}\frac{\partial^2V}{\partial\phi^2}
=0.
$$
We again look for a product solution:
$$
V(r,\theta,\phi)=R(r)\Theta(\theta)\Phi(\phi).
$$
Substituting this expression, dividing by $R\Theta\Phi$ where the factors are nonzero, and multiplying by $r^2$, we obtain
$$
\frac{1}{R}\frac{d}{dr}\left(r^2\frac{dR}{dr}\right)
+\frac{1}{\Theta\sin\theta}\frac{d}{d\theta}
\left(\sin\theta\frac{d\Theta}{d\theta}\right)
+\frac{1}{\Phi\sin^2\theta}\frac{d^2\Phi}{d\phi^2}
=0.
$$
### Separating the Radial Dependence
The first term depends only on $r$, while the remaining terms depend only on the angular coordinates. Therefore, the first term must be a constant, which we denote by $\lambda_r$:
$$
\frac{1}{R}\frac{d}{dr}\left(r^2\frac{dR}{dr}\right)
=\lambda_r.
$$
The angular terms must consequently satisfy
$$
\frac{1}{\Theta\sin\theta}\frac{d}{d\theta}
\left(\sin\theta\frac{d\Theta}{d\theta}\right)
+\frac{1}{\Phi\sin^2\theta}\frac{d^2\Phi}{d\phi^2}
=-\lambda_r.
$$

### Separating the Angular Dependence
The angular variables are still coupled through the factor $1/\sin^2\theta$. Multiplying by $\sin^2\theta$ and rearranging gives
$$
\underbrace{
\frac{\sin\theta}{\Theta}\frac{d}{d\theta}
\left(\sin\theta\frac{d\Theta}{d\theta}\right)
+\lambda_r\sin^2\theta
}_{\text{depends only on }\theta}
+
\underbrace{
\frac{1}{\Phi}\frac{d^2\Phi}{d\phi^2}
}_{\text{depends only on }\phi}
=0.
$$
The same separation argument now applies. Introducing another constant $\lambda_\phi$, we set
$$
\frac{1}{\Phi}\frac{d^2\Phi}{d\phi^2}=\lambda_\phi.
$$
The remaining $\theta$-dependent expression must then equal $-\lambda_\phi$. We have therefore reduced Laplace’s equation to three ordinary differential equations:
$$
\begin{cases}
\displaystyle\frac{d}{dr}\left(r^2\frac{dR}{dr}\right)
&=\lambda_rR,\\[2mm]
\displaystyle\frac{1}{\sin\theta}\frac{d}{d\theta}
\left(\sin\theta\frac{d\Theta}{d\theta}\right)
+\left(\lambda_r+\frac{\lambda_\phi}{\sin^2\theta}\right)\Theta
&=0,\\[2mm]
\displaystyle\frac{d^2\Phi}{d\phi^2}
&=\lambda_\phi\Phi.
\end{cases}
$$
The boundary conditions and regularity requirements will further restrict the separation constants and the corresponding solutions.

Take a azimuthal symmetric for example, then we can restrict $\lambda_\phi=0$, then simplify the equations to a less daunting form.