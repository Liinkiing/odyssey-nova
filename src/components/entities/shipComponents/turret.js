

import P2 from 'p2'

import Projectile from 'entities/projectile'
import ShipComponent from 'entities/shipComponents/shipComponent'
import SC_TYPES from 'constants/shipComponentTypes'
import materials from 'world/materials'
import engineDispatcher from 'dispatchers/engineDispatcher'
import EVENTS from 'constants/events'

/**
 * A turret component is responsible for firing projectiles
 * Its an emitter yay! @TODO add EmitterComponent, thrusters will also need
 * to be emitters when they start creating exhaust trails/particles/fire
 */
export default class Turret extends ShipComponent {
    constructor( opts ) {
        super( opts )

        this.type = SC_TYPES.get( 'TURRET' )
        this.angle = 0

        // this.offset = opts.offset || [ 0, 0 ]

        this.projectile = null

        this.shape = new P2.Circle({
            radius: this.radius,
            material: this.material
        })
    }

    /**
     * For now `schema` is a set of options to create a generic projectile
     * entity, it should ref a projectile id
     * @TODO use a projectile factory and ref by id to create the projectile
     * Does nothing currently as fire() just creates a new projectile itself
     */
    loadProjectile( schema ) {
        if ( !schema ) {
            throw new Error( 'No schema defined to load projectile with' )
        }

        this.projectileSchema = schema
    }

    /**
     * Creates a projectile, adds velocity to it and tells the engine to
     * register it as an entity
     */
    fire() {
        // if ( !this.projectileSchema ) {
        //     throw new Error( 'No schema defined to fire a projectile' )
        // }

        let r = ( this.radius + 3 ) * 1.5
        let angle = ( this.parent.angle + this.angle ) + Math.PI * .5
        let mag = 50

        // Translate turret local position to parent position + turret position
        let position = []
        P2.vec2.toGlobalFrame( position, this.shape.position, this.parent.position, this.parent.angle )

        // Now that we have the relative turret position given the parent position
        // and angle we can extend to the get the firing position
        let firingPos = [
            r * Math.cos( angle ) + position[ 0 ],
            r * Math.sin( angle ) + position[ 1 ],
        ]

        // Add a velocity, relative to the turret current travel momentum (which
        // is equal to the parent velocity)
        let velocity = [
            mag * Math.cos( angle ) + this.parent.body.velocity[ 0 ],
            mag * Math.sin( angle ) + this.parent.body.velocity[ 1 ]
        ]

        let projectile = new Projectile({
            position: firingPos,
            velocity: velocity,
            angle: this.angle
        })

        // Now need some way of adding the entity to the engine world
        engineDispatcher.dispatch({
            type: EVENTS.get( 'ENTITY_ADD' ),
            payload: {
                entities: [ projectile ]
            }
        })
    }
}
