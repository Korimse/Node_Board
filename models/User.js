var mongoose = require('mongoose');

var userSchema = mongoose.Schema({
    username:{type:String, required:[true, 'Username is required!'], unique:true},
    password:{type:String, required:[true, 'Password is required!'], select:false},
    name:{type:String, required:[true, 'Name is required!']},
    email:{type:String}
},{
    toObject:{virtuals:true}
});

userSchema.virtual('passwordConfirmation') 
    .get(()=>{return this._passwordConfirmation;})
    .set((value) => {this._passwordConfirmation=value; });

userSchema.virtual('originalPassword')
    .get(()=>{return this._originPassword;})
    .set((value) => {this._originPassword=value; });

userSchema.virtual('currentPassword')
    .get(()=>{return this._currentPassword;})
    .set((value) => {this._currentPassword=value; });

userSchema.virtual('newPassword')
    .get(() => {return this._newPassword; })
    .set((value)=>{this._newPassword=value; });

userSchema.path('password').validate(function(v){
    var user = this;

    if (user.isNew){
        if(!user.passwordConfirmation){
            user.invalidate('passwordConfirmation', 'Password Confirmation is required.');
        }
        if(user.password !== user.passwordConfirmation){
            user.invalidate('passwordConfirmation', 'Password confirmation does not matched!');
        }
    }

    if(!user.isNew){
        if(!user.currentPassword){
          user.invalidate('currentPassword', 'Current Password is required!');
        }
        else if(user.currentPassword != user.originalPassword){
          user.invalidate('currentPassword', 'Current Password is invalid!');
        }
    
        if(user.newPassword !== user.passwordConfirmation) {
          user.invalidate('passwordConfirmation', 'Password Confirmation does not matched!');
        }
      }
    });

var User = mongoose.model('user', userSchema);
module.exports = User;