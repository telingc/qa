---
id: question-mv63diwx-u5jh
subject: Physics
topic: Electrodynamics
---
Conductors are important, needless to say. We first summarize their fundamental properties and then examine the physical reasoning behind them.
## 1) Fundamental Properties
In electrostatic equilibrium, an ideal conductor has the following properties:
1. **$\mathbf E=\mathbf 0$ inside a conductor**, The electric field inside the conducting material vanishes.
2. **$\rho= 0$ inside a conductor**, the net volume charge density inside the conducting material is zero.
3. Any net charge **resides on the surface.**
4. A connected conductor is an **equipotential**.
5. $E$ is **perpendicular to the surface**, just outside a conductor.
## 2) Physical Reasoning
> Warning: This part is extremely boring, reading the text book may be more enjoyable. :(
### 1. What Is a Conductor?
A conductor contains mobile charge carriers, in common metallic conductors electrons are free to roam (For liquid conductors like salt water, it is ions do the moving part). An ordinary neutral metal contains equal amounts of positive and negative charge. However, a conductor need not be electrically neutral: it may possess a net charge. The essential feature of a conductor is the ability of its charge carriers to move in response to an electric field.
### 2. Why Must the Electric Field Vanish Inside?
Suppose a nonzero electric field $\mathbf{E}_\text{external}$ exists inside the conducting material.
A mobile charge would experience an electric force $\mathbf F=q\mathbf E$. Consequently, the charge carriers would begin to move, and the system would not be in electrostatic equilibrium. The charges therefore redistribute until the total electric field inside the conducting material vanishes:
$$  
\mathbf E_{\mathrm{total}}=\mathbf 0.  
$$
If an external electric field is applied, the redistribution of charges produces an induced electric field that cancels the applied field inside the conductor:
$$  
\mathbf E_{\mathrm{external}}  
+\mathbf E_{\mathrm{induced}}  
=\mathbf 0.  
$$
The important point is that electrostatic equilibrium requires the **total electric field**, rather than each individual contribution, to vanish.
### 3. Why Does Excess Charge Reside on the Surface?
Gauss's law in differential form states that
$$  
\nabla\cdot\mathbf E=\frac{\rho}{\epsilon_0}.  
$$
We know that overall electric field vanishes to $\mathbf{0}$, thus the divergence of the field, $\nabla\cdot\mathbf{E}=\mathbf{0}$, is zero. Thus the critical information we have is that$$\rho=0$$which indicates that there's no volume charge density inside the conductor. Then the question is, charges are needed to form the interior field to cancel out the exterior field. The answer is that the charge reside on the surface of the conductor.

Notice that this doesn't mean that there are no charges inside the material. Positive and negative charges are still present, but their macroscopic net charge density is zero. The surface may include both the outer surface of the conductor and the inner surfaces of any cavities.
### 4. Why Is a Conductor an Equipotential?
The electric field and electric potential are related by $\mathbf E=-\nabla V$. Since the electric field vanishes inside the conducting material, $\nabla V=\mathbf 0$. Therefore, the potential is constant throughout a connected conductor:
$$  
V=\text{constant}.  
$$
The conductor's surface has the same potential as its interior.
### 5. Why Is the Electric Field Perpendicular to the Surface?
If a tangential component of the electric field existed at the conductor's surface, mobile charges would experience a force along the surface and continue to move.

Therefore, electrostatic equilibrium requires $\mathbf E_{\parallel}=\mathbf 0$.The electric field immediately outside the surface must be normal to it. Using the electrostatic boundary condition, $\displaystyle E_{\mathrm{in}}^{\perp}=\frac{\sigma}{\epsilon_0}$, and noting that the field inside the conductor is $\mathbf{0}$, we obtain $\displaystyle \frac{\sigma}{\epsilon_0}\hat{\mathbf n}$ where $\hat{\mathbf n}$ is the outward unit normal and $\sigma$ is the local surface charge density.