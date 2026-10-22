---
id: example-griffiths4e-2-1
parent: superposition
---
# Polygon Symmetry
Let $R$ be the circumradius and $Q$ the test charge at the center. In the 12-sided case, the removed charge is the one at "6 o'clock"; determine the magnitude and direction of the force.
1. Twelve equal charges, $q$ , are situated at the corners of a regular 12-sided polygon. What is the net force on a test charge at the center, what if one of the charges is missing? Consider the electrostatic field at the center.
2. Repeat the force calculation for a regular 13-sided polygon, first with every charge present and then with one charge removed; specify the removed vertex and explain the direction.
3. Optional extension: consider a regular n-sided polygon, $n\geq3$, and describe both the force and the source electric field.
### 1. 12-sided Polygon
For the cases of regular even-sided polygon, it's quite easy to understand that for every charge in the corner, a charge at the opposite corner must exists, their net forces to the test charge in the center is same in magnitude but contradictory pointing. Thus the net force on a test charge at the center is $0$. Intuitively, we can even predict that for highly symmetric even-sided polygon, the net force on a test charge in the center is $0$.

Since we've already know that the net force of all stationary charges on the test charge in the center is $0$, if one of the charges is missing, the rest charges have to form the contradictory pointing force so that the force is $0$ for the cases above.

Thus the answer is:
1. $\mathbf{F}=\mathbf{0}$.
2. $\displaystyle{\mathbf{F}=\frac{1}{4\pi\epsilon_0}\frac{qQ}{R^2}\hat{\mathbf{R}}}$, $\hat{\mathbf{R}}$ pointing the original position of the missing charge.
3. $\displaystyle{\mathbf{F}=q\mathbf{E},\,\,\begin{cases}\mathbf{E}=\mathbf{0},\,\text{For case 1.}\\\mathbf{E}=\frac{1}{4\pi\epsilon_0}\frac{Q}{R^2}\hat{\mathbf{R}},\,\text{For case 2.}\end{cases}}$
### 2. 13-sided Polygon
Now the odd-sided case is kind tricky, but it demonstrates the superposition principle best.$$\mathbf{F}=\frac{1}{4\pi\epsilon_0}\sum_{i=1}^{13}\frac{qQ}{R^2}\hat{\mathbf{R}}_i$$The point is vector summation $\displaystyle{\sum_{i=1}^{2n+1}\hat{\mathbf{R}}_i}$ , here we provide two ways:
1. Calculate the vector summation using coordinates.
2. Calculate on the complex plane $\mathbb{C}^2$.
For the first case it's trivial to think of but tricky to calculate, since:$$\hat{\mathbf{R}}_i=(\cos\frac{2(i-1)}{2n+1}\pi,\sin\frac{2(i-1)}{2n+1}\pi)$$And we calculate from $1$ to $2n+1$, but that looks a little out of balance. What's equivalent to the value we're calculating is:$$\displaystyle{\sum_{i=1}^{2n+1}\hat{\mathbf{R}}_i}=\displaystyle{(\sum_{i=0}^{2n}\cos\frac{2\pi i}{2n+1},\sum_{j=0}^{2n}\sin\frac{2\pi j}{2n+1})}$$Let $\theta=\displaystyle\frac{2\pi}{2n+1}$, thus we're calculating $\displaystyle \sum_{i=0}^{2n}\cos{i\theta}$, it may be astonishing if you ever seen:$$2\sin{\frac{\theta}{2}}\cos{i\theta}=\sin{(i\theta+\frac{1}{2}\theta)-\sin{(i\theta-\frac{1}{2}\theta)}}$$We can use this unique property to calculate the summation$$\sum_{i=0}^{2n}\cos{i\theta}=\frac{1}{2\sin{\frac{\theta}{2}}}\sum_{i=0}^{2n}[\sin{(i\theta+\frac{1}{2}\theta)-\sin{(i\theta-\frac{1}{2}\theta)}}]$$With this property, we transfer the former complex equation now become simply$$\sum_{i=0}^{2n}\cos{i\theta}=\frac{1}{2\sin{\frac{\theta}{2}}}[\sin{(2n+\frac{1}{2})\theta+\sin(\frac{\theta}{2})}]=0$$And we can easily do the same thing to summation $\displaystyle \sum_{i=0}^{2n}\sin i\theta$ by this formula:$$2\sin{\frac{\theta}{2}}\sin{i\theta}=\cos{(i\theta-\frac{1}{2}\theta)-\cos{(i\theta+\frac{1}{2}\theta)}}$$The answer is the same, thus we have the original summation, $\displaystyle{\sum_{i=1}^{2n+1}\hat{\mathbf{R}}_i}$, to be equal to $0$.

For the second case, things become even clearer. Here we're introducing the elegant Euler's Theorem:$$\mathrm{e}^{\mathrm ix}=\cos x+\mathrm{i}\sin x$$Then we calculate the summations above together simply by adding them up$$\sum_{j=0}^{2n}\mathrm{e}^{\mathrm i\theta \,j}=\frac{1-\mathrm{e}^{\mathrm i\theta \,(2n+1)}}{1-\mathrm{e}^{\mathrm i\theta}}=\frac{1-\mathrm{e}^{2\pi\mathrm i}}{1-\mathrm{e}^{\mathrm i\theta}}=0$$Similarly, if one of the charges at the corner of the odd-sided polygon, we can calculate the net force and the field by calculating the field induced by only missing charge and take it's opposite.
### 3. N-sided Polygon
From our discussion above, now we can come to a conclusion that for n-sided regular polygon with charges at the corner, the net force and the field on the test charge at the center is $\mathbf{0}$.
# Bonus Topic
What if we take a special case of the regular polygon: we take the limitation that the number of sides go infinite. That is a circular charged ring, another example we'll discuss. But what if it's inside a charged sphere, the limitation case of polyhedron? The answer is, inside the charged spherical surface, the electrostatic field is always zero.
# Source
Griffiths, *Introduction to Electrodynamics*, 4th edition (2013), Problem 2.1, printed p. 60-61 (PDF p. 79-80).